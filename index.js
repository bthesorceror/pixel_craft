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

rudder.get("/([a-zA-Z0-9]*).json", function(req, res, key) {
  var runner = new Runner5(image_store, image_store.get);

  runner.on('success', function(doc) {
    res.writeHead(200, { 'Content-type': 'application/json' });
    res.end(JSON.stringify(doc));
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

rudder.post("/save", function(req, res) {
  var collector = new TaxCollector(req);

  collector.on('ready', function(data) {
    var json = JSON.parse(data);
    image_store.save(json, function(err) {
      var status_code = err ? err.status_code : 200;
      res.writeHead(status_code);
      res.end();
    });
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

journeyman.listen();
