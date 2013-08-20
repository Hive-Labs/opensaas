var uuid = require('node-uuid');

module.exports = function (client) {
  return {
    create: function (application, collection, entity, object, next) {
      var _id = uuid();
      client.hmset(application + ':' + collection + ':' + entity + ':' + _id, object);
      object._id = _id;
      next(object);
    },
    findById: function (application, collection, entity, id, next) {
      client.hgetall(application + ':' + collection + ':' + entity + ':' + id, function (err, obj) {
        obj._id = application + ':' + collection + ':' + entity + ':' + id;
        next(obj);
      });
    },
    update: function (application, collection, entity, object, next) {
      var obj_id = object._id;
      delete object._id;
      client.hmset(application + ':' + collection + ':' + entity + ':' + obj_id, object);
    },
    del: function (application, collection, entity, id, next) {
      client.del(application + ':' + collection + ':' + entity + ':' + id);
    }
  };
};
