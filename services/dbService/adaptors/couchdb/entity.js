var uuid = require('node-uuid');
var http = require('http');

// next is always called with the arguments
// next(err, obj)

module.exports = function(conn, settings) {
  return {
    create: function(application, collection, entity, object, next) {
      var db = getDb(conn, application, function(err, db) {
        if (err) {
          logger.error("getDB error:");
          logger.error(err);
          next(err);
        } else {
          var viewName = '_design/' + nsBuilder([collection, entity], 2);
          db.save(viewName, {
            views: {
              all: {
                map: "function(doc) {if(doc._view == '" + viewName + "'){emit(doc);}}"
              }
            }
          });
          object._view = viewName;
          db.save(object, function(err, res) {
            if (err) {
              logger.error("db.save error:");
              logger.error(err);
            }
            next(err, object);
          });
        }
      });
    },

    findById: function(application, collection, entity, id, next) {
      var db = getDb(conn, application, function(err, db) {
        if (err) {
          logger.error("getDB error:");
          logger.error(err);
          next(err);
        } else {
          logger.info("Searching for id: " + id);
          db.get(id, function(err, res) {
            console.log(res);
            delete res._view;
            next(err, res);
          });
        }
      });
    },
    findAll: function(application, collection, entity, queryString, next) {
      var db = getDb(conn, application, function(err, db) {
        if (err) {
          logger.error("getDB error:");
          logger.error(err);
          next(err);
        } else {
          var viewName = nsBuilder([collection, entity], 2) + "/all";
          logger.info("Searching for view: " + viewName);
          db.view(viewName, function(err, res) {
            if (err) {
              next(err, []);
            } else {
              next(err, res);
            }
          });
        }
      });
    },

    update: function(application, collection, entity, object, next) {
      var db = getDb(conn, application, function(err, db) {
        if (err) {
          logger.error("getDB error:");
          logger.error(err);
          next(err);
        } else {
          var _id = object._id;
          delete object._id;
          db.merge(_id, object, function(err, res) {
            object._id = _id;
            if (err) {
              next(exceptions.entity.updateException(res), object);
            } else {
              next(null, object); //XXX should return whole obj? efficiency of that?
            }
          });
        }
      });
    },

    del: function(application, collection, entity, id, next) {
      var db = getDb(conn, application, function(err, db) {
        if (err) {
          logger.error("getDB error:");
          logger.error(err);
          next(err);
        } else {
          db.remove(id, function(err, res) {
            next(err, res);
          });
        }
      });
    }
  };
};

function getDb(conn, dbNameStr, next) {
  var db = conn.database(dbNameStr);
  db.exists(function(err, exists) {
    if (err) { //TODO log this
      logger.error('couch error: ', err);
    } else if (!exists) {
      logger.info("Creating new database: " + dbNameStr);
      db.create(function(err, obj) {
        logger.info(obj);
        next(err, db);
      });
    } else {
      next(err, db);
    }
  });
}

function nsBuilder(namespaceElements, numElements) {
  var ns = [].slice.call(namespaceElements);
  if (numElements) ns = ns.slice(0, numElements);
  return ns.join(':');
}