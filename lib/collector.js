var Writable = require('stream').Writable;

function Collector() {
  Writable.call(this);
  this.data = "";
}

(require('util')).inherits(Collector, Writable);

Collector.prototype._write = function(chunk, encoding, next) {
  this.data += chunk;
  next();
}

Collector.prototype.end = function() {
  Writable.prototype.end.apply(this, arguments);
  process.nextTick(function() {
    this.emit('ready', this.data);
  }.bind(this));
}

module.exports = Collector;
