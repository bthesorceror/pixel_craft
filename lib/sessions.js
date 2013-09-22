var uuid    = require('uuid');
var Cookies = require('cookies');
var Runner5 = require('runner5');

function Session(id, ttl, client) {
  this.id     = id;
  this.ttl    = ttl;
  this.client = client;
}

Session.prototype.set = function(key, val, cb) {
  var getter = new Runner5(this.client, this.client.get);
  var setter = new Runner5(this.client, this.client.setex);

  getter.on('success', function(json) {
    var obj = JSON.parse(json);
    obj[key] = val;
    setter.run(this.id, this.ttl, JSON.stringify(obj));
  }.bind(this));

  setter.on('success', cb);
  setter.run(this.id);
}

Session.prototype.get = function(key, cb) {
  var getter = new Runner5(this.client, this.client.get);

  getter.on('success', function(json) {
    var obj = JSON.parse(json);
    cb(null, obj[key]);
  }.bind(this));

  getter.run(this.id);
}

Session.prototype.touch = function(success, err) {
  var getter = new Runner5(this.client, this.client.get);
  var setter = new Runner5(this.client, this.client.setex);

  getter.on('failure', err);
  setter.on('failure', err);

  getter.on('success', function(doc) {
    doc = doc || JSON.stringify({});
    setter.run(this.id, this.ttl, doc);
  }.bind(this));

  setter.on('success', success);
  getter.run(this.id);
}

function Middleware(ttl) {
  this.ttl    = ttl;
  this.client = (require('redis')).createClient();
  this.session_key = 'session_id';
}

Middleware.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    var cookies = new Cookies(req, res);
    var session_id = cookies.get(self.session_key);
    if (!session_id) { session_id = uuid.v1(); }
    cookies.set(self.session_key, session_id);
    req.session = new Session(session_id, self.ttl, self.client);
    req.session.touch(next, function() {
      req.writeHead(500);
      req.end("sessions are not working");
    });
  };
}

module.exports = Middleware;
