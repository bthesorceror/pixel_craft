var nano = require('nano');

function ImageStore(url) {
  this.database = nano(url);
}

ImageStore.buildImageUrl = function(name) {
  var path = "/static/uploads/",
      extension = ".png",
      timestamp = +(new Date());
  return path + name + "_" + timestamp + extension;
}

ImageStore.prototype.get = function(key, cb) {
  this.database.get(key, function(err, body) {
    if (err) {
      cb(err, null);
    } else {
      var doc = {
        name: body.name,
        blocks: body.blocks,
        dataURL: body.dataURL
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

ImageStore.prototype.destroy = function(key, cb) {
  var db = this.database;
  db.get(key, function(err, doc) {
    if (err) {
      cb(err, null);
      return;
    }
    doc['_deleted'] = true;
    db.insert(doc, function(err) {
      cb(err, doc);
    });
  });
}

ImageStore.prototype.list = function(cb) {
  var self = this,
      db = self.database,
      names = [];
  db.list(function(err, body) {
    var data = {
      items: []
    };
    if (err) {
      cb(err, null);
    }
    else {
      names = body.rows.map(function(row) { return row.id; });
      db.fetch({ ids: names }, { include_docs: true }, function(err, blob) {
        blob.rows.forEach(function(item) {
          data.items.push({
            name: item.doc.name,
            screenshot: item.doc.screenshot,
            blocks: item.doc.blocks
          });
        });
        cb(null, data);
      });
    }
  });
}

module.exports = ImageStore;
