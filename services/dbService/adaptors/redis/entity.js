var uuid = require('node-uuid');

// next is always called with the arguments
// next(err, obj)


module.exports = function (client, settings) {
  return {
    create: function (application, collection, entity, object, next) {
      var _id = uuid();
      client.hmset(nsBuilder(arguments, 3) + ':' + _id, object); // hmset doesn't return success?
      object._id = _id;
      next(null, object);
    },

    //TODO find out how to auto recast types, currently everything is a string because... redis
    findById: function (application, collection, entity, id, next) {
      client.hgetall(nsBuilder(arguments, 4), function (err, obj) {
        if(err || !obj) {
          next(exceptions.entity.notFoundException('Could not find object with the given id ' + id), obj));
        } else {
          obj._id = id;
          next(null, obj);
        }
      });
    },

    // the queryString is a wildcarded glob of the id
    findAll: function (application, collection, entity, queryString, next) {
      client.keys(nsBuilder(arguments, 4), function (err, keys) {
      }
    },

    update: function (application, collection, entity, object, next) {
      var obj_id = object._id;
      delete object._id;
      if(client.hmset(nsBuilder(arguments, 4), object)) {
        object._id = obj_id;
        next(null, object);
      } else {
        object._id = obj_id;
        next(exceptions.entity.updateException('Could not update object with id ' + object._id), object);
      }
    },

    del: function (application, collection, entity, id, next) {
      this.findById(nsBuilder(arguments, 4), function (err, obj) {
        if(err) {
          next(err, obj);
        } else {
          if(client.del(nsBuilder(arguments, 4))) {
            next(null, obj);
          } else {
            next(exceptions.entity.deleteException('Could not delete object with id ' + id), obj));
          }
        }
      });
    }
  };
};

function nsBuilder(namespaceElements, numElements) {
  var ns = [].slice.call(namespaceElements);
  if(numElements) ns = ns.slice(0, numElements);
  return ns.join(':');
}
