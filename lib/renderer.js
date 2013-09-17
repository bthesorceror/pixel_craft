var path       = require('path');
var jade       = require('jade');
var views_path = path.join(__dirname, '..', 'views');

module.exports = function(req, res, next) {
  res.render = function(file_path, params) {
    var output = jade.renderFile(path.join(views_path, file_path + '.jade'), params || {});
    this.writeHead(200, { 'Content-type': 'text/html' });
    this.end(output);
  }
  next();
};
