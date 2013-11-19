var uuid = require('node-uuid');
var http = require('http');

// next is always called with the arguments
// next(err, obj)

// required settings:
//  hostname
//  port

module.exports = function (client, settings) {
  return {
    create: function (application, collection, entity, object, next) {
    },

    findById: function (application, collection, entity, id, next) {
    },

    // the queryString is a wildcarded glob of the id
    findAll: function (application, collection, entity, queryString, next) {
    },

    update: function (application, collection, entity, object, next) {
    },

    del: function (application, collection, entity, id, next) {
    }
  };
};

function httpOptionsBuilder(path, method) {
  var options = {
    host: settings.hostname || 'localhost',
    port: settings.port || 5984,
    path: path,
    method: method
  }
  return options;
}

function nsBuilder(namespaceElements, numElements) {
  var ns = [].slice.call(namespaceElements);
  if(numElements) ns = ns.slice(0, numElements);
  return ns.join(':');
}
