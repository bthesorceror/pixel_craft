var nano = require('nano');

function ImageStore(url) {
  this.database = nano(url);
}

ImageStore.prototype.save = function(data, cb) {
  this.database.insert(data, data.name, function(err, body) {
    cb(err);
  });
}

module.exports = ImageStore;
