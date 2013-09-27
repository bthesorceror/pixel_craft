var uuid    = require('uuid');
var Cookies = require('cookies');
var Runner5 = require('runner5');

function Session(id, ttl, client) {
  this.id     = id;
  this.ttl    = ttl;
  this.client = client;
}

Session.prototype.get = function(cb) {
  var getter = new Runner5(this.client, this.client.get);

  getter.on('success', function(json) {
    var obj = json ? JSON.parse(json) : {};
    cb(null, obj);
  }.bind(this));

  getter.on('failure', function(err) {
    cb(err, null);
  });

  getter.run(this.id);
}

Session.prototype.save = function(doc) {
  var setter = new Runner5(this.client, this.client.setex);
  setter.run(this.id, this.ttl, JSON.stringify(doc));
}

function Middleware(ttl, options) {
  options = options || {};

  var port = options['port'] || 6379;
  var host = options['host'] || '127.0.0.1';

  this.ttl    = ttl;
  this.client = (require('redis')).createClient(port, host, options);
  this.session_key = 'session_id';
}

Middleware.prototype.middleware = function() {
  var self = this;
  return function(req, res, next) {
    var cookies = new Cookies(req, res);
    var session_id = cookies.get(self.session_key);

    if (!session_id) { session_id = uuid.v1(); }
    cookies.set(self.session_key, session_id);

    var session = new Session(session_id, self.ttl, self.client);
    var runner = new Runner5(session, session.get);

    runner.on('success', function(doc) {
      req.session = doc;
      next();
    });

    runner.on('failure', function(error) {
      this.handleError(req, res, "Failure with your session");
    }.bind(this));

    runner.run();

    res.on('finish', function() {
      session.save(req.session);
    });
  };
}

module.exports = Middleware;
