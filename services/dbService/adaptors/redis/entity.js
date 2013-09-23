var uuid = require('node-uuid');

// next is always called with the arguments
// next(err, obj)


module.exports = function (client, settings) {
  return {
    create: function (application, collection, entity, object, next) {
      var _id = uuid();
      client.hset(nsBuilder(arguments, 3), _id, JSON.stringify(object), function (err, res) {
        if(err) {
          next(exceptions.entity.createException(err), object);
        } else {
          object._id = _id;
          next(null, object);
        }
      });
    },

    //TODO find out how to auto recast types, currently everything is a string because... redis
    findById: function (application, collection, entity, id, next) {
      client.hget(nsBuilder(arguments, 3), id, function (err, res) {
        if(err || !res) {
          next(exceptions.entity.notFoundException('Could not find object with the given id ' + id), null);
        } else {
          obj = JSON.parse(res);
          obj._id = id;
          next(null, obj);
        }
      });
    },

    // the queryString is a wildcarded glob of the id
    findAll: function (application, collection, entity, queryString, next) {

    },

    update: function (application, collection, entity, object, next) {
      var _id = object._id;
      delete object._id;
      client.hset(nsBuilder(arguments, 3), _id, JSON.stringify(object), function (err, res) {
        object._id = _id;
        if(err) {
          next(exceptions.entity.updateException('Could not update object with id ' + object._id), object);
        } else {
          next(null, object);
        }
      });
    },

    del: function (application, collection, entity, id, next) {
      client.hdel(nsBuilder(arguments, 3), id, function (err, res) {
        if(err || res === '0') {
          next(exceptions.entity.deleteException('Could not delete object with id ' + id), obj);
        } else {
          next(null, obj);
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
