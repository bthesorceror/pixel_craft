var nano = require('nano');

function ImageStore(url) {
  this.database = nano(url);
}

ImageStore.prototype.get = function(key, cb) {
  this.database.get(key, function(err, body) {
    if (err) {
      cb(err, null);
    } else {
      var doc = {
        name: body.name,
        data: body.data
      }
      cb(null, doc);
    }
  });
}

ImageStore.prototype.save = function(data, cb) {
  this.database.insert(data, data.name, function(err, body) {
    cb(err);
  });
}

module.exports = ImageStore;
