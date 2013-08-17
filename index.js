var LightningStrike = require('lightning_strike');
var Journeyman      = require('journeyman');
var Rudder          = require('rudder');
var path            = require('path');
var jade            = require('jade');

var journeyman = new Journeyman(3000);
var rudder = new Rudder();
var strike = new LightningStrike(path.join(__dirname, 'static'));

var views_path = path.join(__dirname, 'views');

rudder.get(/\/$/, function(req, res) {
  res.render('index');
});

journeyman.use(rudder.middleware());
journeyman.use(strike.middleware());

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
