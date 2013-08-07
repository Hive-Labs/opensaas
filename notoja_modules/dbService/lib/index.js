var http = require('http'),
  rest = require('restler');

var serverHost = "";
var applicationName = "";

//Must call this before using the dbService module
exports.init = function(serverHost, applicationName) {
  this.serverHost = serverHost;
  this.applicationName = applicationName;
};

exports.get = function(collectionName, entityType, entityId) {
  console.log("Get entity by id");
  rest.get(serverHost + '/entity/' + applicationName + "/" + collectionName + "/" + entityType + "/" + entityId).on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error: ' + result.message);
      this.retry(5000); // try again after 5 sec
    } else {
      return JSON.parse(result);
    }
  });
};
//Unimplimented
exports.get = function(collectionName, entityType) {
  console.log("Get entity by id");
  rest.get(serverHost + '/entity/' + applicationName + "/" + collectionName + "/" + entityType).on('complete', function(result) {
    if (result instanceof Error) {
      console.log('Error: ' + result.message);
      this.retry(5000); // try again after 5 sec
    } else {
      return JSON.parse(result);
    }
  });
};
//Unimplimented
exports.set = function(collectionName, entityType, entityId) {
  console.log("Set entity by id");
  rest.post(serverHost + '/entity/' + applicationName + "/" + collectionName + "/" + entityType + "/" + entityId, {
  }).on('complete', function(data) {
    console.log(JSON.parse(data));
    return JSON.parse(data);
  });
};
//Unimplimented
exports.set = function(collectionName, entityType) {
  console.log("Set entity by id");
  rest.post(serverHost + '/entity/' + applicationName + "/" + collectionName + "/" + entityType, {
  }).on('complete', function(data) {
    console.log(JSON.parse(data));
    return JSON.parse(data);
  });
};
//Unimplimented
exports.remove = function(collectionName, entityType, entityId) {
  console.log("Set entity by id");
  rest.del(serverHost + '/entity/' + applicationName + "/" + collectionName + "/" + entityType + "/" + entityId, {
  }).on('complete', function(data) {
    console.log(JSON.parse(data));
    return JSON.parse(data);
  });
};


/*
// db information routes
app.get('/', routes.db.dbInformation);
app.get('/db', routes.db.dbInformation);
app.get('/db/:application', routes.applicationInformation);


// Schema Routes
app.get('/schema/get/:application', routes.schema.get);
app.post('/schema/migrate/:application', routes.schema.migrate);
*/