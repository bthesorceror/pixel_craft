var dotenv = require("dotenv")();
dotenv.load();
var LightningStrike = require('lightning_strike');
var TaxCollector    = require('tax_collector');
var Journeyman      = require('journeyman');
var Rudder          = require('rudder');
var path            = require('path');
var jade            = require('jade');
var Runner5         = require('runner5');

var ImageStore      = require('./lib/image_store');

var journeyman  = new Journeyman(3000);
var rudder      = new Rudder();
var strike      = new LightningStrike(path.join(__dirname, 'static'));
var image_store = new ImageStore(process.env.IMAGE_STORE_URL);
var name_regex = "([a-zA-Z0-9]*)";

rudder.get("/list.json", function(req, res) {
  var runner = new Runner5(image_store, image_store.list);
  runner.resource = res;

  bindRunnerEvents(runner);

  runner.run();
});

rudder.get("/new", function(req, res) {
  res.render("show");
});

rudder.get("/design/" + name_regex, function(req, res, key) {
  res.render("show");
});

rudder.get("/item/" + name_regex + ".json", function(req, res, key) {
  var runner = new Runner5(image_store, image_store.get);
  runner.resource = res;

  bindRunnerEvents(runner);

  runner.run(key);
});

rudder.get("/images/([a-zA-Z0-9]*).png", function(req, res, key) {
  var runner = new Runner5(image_store, image_store.get);

  runner.on('success', function(doc) {
    res.writeHead(200, { 'Content-type': 'image/png' });
    var buffer = new Buffer(doc.dataURL.replace(/^data:.+,/, ""), "base64");
    res.end(buffer);
  });

  runner.on('failure', function(err) {
    res.writeHead(500);
    res.end("Failed to retreive document");
  });

  runner.run(key);
});

rudder.get("/", function(req, res) {
  res.render('index');
});

rudder.del("/design/" + name_regex, function(req, res, key) {
  var runner = new Runner5(image_store, image_store.destroy);

  runner.on("success", function() {
    res.writeHead(200, { "Content-type": "text/plain" });
    res.end("ok");
  });

  runner.on("failure", function(err) {
    console.log(err);
    res.writeHead(500, { "Content-type": "text/plain" });
    res.end();
  });
  runner.run(key);
});

rudder.post("/save", function(req, res) {
  var collector = new TaxCollector(req);
  var json;

  var runner = new Runner5(image_store, image_store.save);

  runner.on('success', function() {
    res.writeHead(200);
    res.end();
  });

  runner.on('failure', function(err) {
    res.writeHead(err.status_code);
    res.end();
  });

  collector.on('ready', function(data) {
    json = JSON.parse(data);
    json.screenshot = ImageStore.buildImageUrl(json.name);
    runner.run(json);
  });
});

journeyman.use(rudder.middleware());
journeyman.use(strike.middleware());

var views_path = path.join(__dirname, 'views');
journeyman.use(function(req, res, next) {
  res.render = function(file_path, params) {
    params = params || {};
    var output = jade.renderFile(path.join(views_path, file_path + '.jade'), params);
    this.writeHead(200, { 'Content-type': 'text/html' });
    this.end(output);
  }
  next();
});

function bindRunnerEvents(runner) {
  runner.on('success', function(doc) {
    runner.resource.writeHead(200, { 'Content-type': 'application/json' });
    runner.resource.end(JSON.stringify(doc));
  });

  runner.on('failure', function(err) {
    runner.resource.writeHead(500);
    runner.resource.end("Failed to retreive document");
  });
}

journeyman.listen();
