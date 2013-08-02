var _ = require('underscore');
var db = {};
///////////// Entity Actions ////////////////////
module.exports.entity.create = function(application, collection, entity, object, next) {

};

module.exports.entity.find = function(application, collection, entity, query, next) {

};

module.exports.entity.findById = function(application, collection, entity, id, next) {
  // body...
};

module.exports.entity.update = function(application, collection, entity, object, next) {

};

module.exports.entity.del = function(application, collection, entity, id, next) {

};



///////////// Schema Actions ////////////////////
module.exports.schema.migrate = function(migration, next) {

};

module.exports.schema.get = function(next) {

};


///////////////// DB Actions //////////////////////
module.exports.dbConnect = function(url, username, password) {

};
