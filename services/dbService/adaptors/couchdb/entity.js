var uuid = require('node-uuid');
var http = require('http');

// next is always called with the arguments
// next(err, obj)

module.exports = function (conn, settings) {
  return {
    create: function (application, collection, entity, object, next) {
      var db = getDb(conn, application);
      db.save(object, function(err, res) {
      });
    },

    findById: function (application, collection, entity, id, next) {
    },

    findAll: function (application, collection, entity, queryString, next) {
    },

    update: function (application, collection, entity, object, next) {
      var db = getDb(conn, application);
      var _id = object._id;
      delete object._id;
      db.merge(_id, object, function(err, res) {
        object._id = _id;
        if(err) {
          next(exceptions.entity.updateException(res), object);
        } else {
          next(null, object); //XXX should return whole obj? efficiency of that?
        }
      });
    },

    del: function (application, collection, entity, id, next) {
    }
  };
};

function getDb(conn, dbNameStr) {
  var db = conn.database(dbNameStr);
  db.exists(function (err, exists) {
    if(err) {//TODO log this
    } else if(exists) {
      return db;
    } else {
      db.create();
      return db;
    }
  });
}

function nsBuilder(namespaceElements, numElements) {
  var ns = [].slice.call(namespaceElements);
  if(numElements) ns = ns.slice(0, numElements);
  return ns.join(':');
}
