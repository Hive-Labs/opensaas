var uuid = require('node-uuid');

// next is always called with the arguments
// next(err, obj)


module.exports = function (client) {
  return {
    create: function (application, collection, entity, object, next) {
      var _id = uuid();
      client.hmset(application + ':' + collection + ':' + entity + ':' + _id, object); // hmset doesn't return success?
      object._id = _id;
      next(null, object);
    },

    //TODO find out how to auto recast types, currently everything is a string because... redis
    findById: function (application, collection, entity, id, next) {
      client.hgetall(application + ':' + collection + ':' + entity + ':' + id, function (err, obj) {
        if(err || !obj) {
          next( { error: "ObjectNotFoundException", description: "could not find object with the given id " + id }, obj);
        } else {
          obj._id = id;
          next(null, obj);
        }
      });
    },

    update: function (application, collection, entity, object, next) {
      var obj_id = object._id;
      delete object._id;
      if(client.hmset(application + ':' + collection + ':' + entity + ':' + obj_id, object)) {
        object._id = obj_id;
        next(null, object);
      } else {
        object._id = obj_id;
        next({ error: "InternalUpdateException", description: "could not update object" }, object);
      }
    },

    del: function (application, collection, entity, id, next) {
      this.findById(application, collection, entity, id, function (err, obj) {
        if(err) {
          next(err, obj);
        } else {
          if(client.del(application + ':' + collection + ':' + entity + ':' + id)) {
            next(null, obj);
          } else {
            next({ error: "InternalDeleteException", description: "could not delete object" }, obj);
          }
        }
      });
    }
  };
};

