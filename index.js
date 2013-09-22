if (process.env.NODE_ENV != 'production') {
  var dotenv = require("dotenv")();
  dotenv.load();
}

var LightningStrike = require('lightning_strike');
var TaxCollector    = require('tax_collector');
var Journeyman      = require('journeyman');
var Session         = require('./lib/sessions');
var Rudder          = require('rudder');
var path            = require('path');
var Runner5         = require('runner5');

var ImageStore      = require('./lib/image_store');

var journeyman  = new Journeyman(3000);
var rudder      = new Rudder();
var sessions    = new Session(30 * 60);
var strike      = new LightningStrike(path.join(__dirname, 'static'));
var image_store = new ImageStore(process.env.IMAGE_STORE_URL);
var name_regex = "([a-zA-Z0-9]*)";

rudder.get("/list.json", function(req, res) {
  var runner = new Runner5(image_store, image_store.list);

  sendCouchResponse(runner, res);

  runner.run();
});

rudder.get("/new", function(req, res) {
  res.render("show", { colors: ImageStore.colors });
});

rudder.get("/design/" + name_regex, function(req, res, key) {
  res.render("show", { colors: ImageStore.colors });
});

rudder.get("/item/" + name_regex + ".json", function(req, res, key) {
  var runner = new Runner5(image_store, image_store.get);

  sendCouchResponse(runner, res);

  runner.run(key);
});

rudder.get("/images/([a-zA-Z0-9]*).png", function(req, res, key) {
  var runner = new Runner5(image_store, image_store.getImage);

  runner.on('success', function(image) {
    res.writeHead(200, { 'Content-type': 'image/png' });
    res.end(image);
  });

  runner.on('failure', commonFailure(res));

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
    res.writeHead(500, { "Content-type": "text/plain" });
    res.end();
  });
  runner.run(key);
});

rudder.post("/save", function(req, res) {
  var collector = new TaxCollector(req);

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
    var json = JSON.parse(data);
    json.screenshot = ImageStore.buildImageUrl(json.name);
    runner.run(json);
  });
});

journeyman.use(rudder.middleware());
journeyman.use(sessions.middleware());
journeyman.use(strike.middleware());
journeyman.use(require('./lib/renderer'));

function commonFailure(response) {
  return function(err) {
    response.writeHead(500);
    response.end("Failed to retreive document");
  }
}

function sendCouchResponse(runner, response) {
  runner.on('success', function(doc) {
    response.writeHead(200, { 'Content-type': 'application/json' });
    response.end(JSON.stringify(doc));
  });

  runner.on('failure', commonFailure(response));
}

journeyman.listen();
