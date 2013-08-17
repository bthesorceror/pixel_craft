var LightningStrike = require('lightning_strike');
var Journeyman      = require('journeyman');
var Rudder          = require('rudder');
var path            = require('path');

var journeyman = new Journeyman(3000);
var rudder = new Rudder();
var strike = new LightningStrike(path.join(__dirname, 'static'));

journeyman.use(rudder.middleware());
journeyman.use(strike.middleware());

journeyman.listen();
