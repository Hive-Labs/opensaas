var uuid = require('node-uuid');


module.exports = function(connection) {

  /*
   * The object passed to create is the object to store of type entity
   */
  module.exports.create = function(application, collection, entity, object, next) {
    try {
      object._id = uuid.v4();
      connection[application][collection][entity][object._id] = object;
      next(connection[application][collection][entity][object._id], null);
    } catch (err) {
      console.error('Failed to save entity object', err);
      next({ failure:true, exception: 'OBJECT_SAVE_ERROR', data: err }, true);
    }
  };


  /*
   * query is a SQL string, we support a limited subset of SQL
   */
  module.exports.find = function(application, collection, entity, query, next) {
    if(query) {

    } else {
      next(next(connection[application][collection][entity]));
    }
  };


  module.exports.findById = function(application, collection, entity, id, next) {
    next(connection[application][collection][entity][id], null);
  };


  module.exports.update = function(application, collection, entity, object, next) {
    connection[application][collection][entity][object._id] = object;
  };


  module.exports.del = function(application, collection, entity, id, next) {
    var temp = connection[application][collection][entity][id];
    connection[application][collection][entity][id] = undefined;
    next(temp, null);
  };
};