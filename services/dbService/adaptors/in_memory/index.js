module.exports = function(settings) {
  var connection = null;
  var db = require('./db');
  db.connect(connection);

  module.exports.entity = require('./entity')(connection);
  module.exports.schema = require('./schema')(connection);
};
