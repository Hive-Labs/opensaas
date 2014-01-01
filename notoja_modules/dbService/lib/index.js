var http = require('http'),
  rest = require('restler'),
  winston = require('winston');

// setup the logger
var logger = new winston.Logger({
  transports: [
    new(winston.transports.Console)({
      handleExceptions: true
    })
  ],
  exitOnError: false
});

logger.cli();

var serverHost = "";
var applicationName = "";
var serverPort = 0;

exports.init = function(serverHost, serverPort, applicationName) {
  this.serverHost = serverHost;
  this.applicationName = applicationName;
  this.serverPort = serverPort;
  logger.info("DbService_module: host set to " + this.serverHost);
  logger.info("DbService_module: port set to " + this.serverPort);
  logger.info("DbService_module: application name set to " + this.applicationName);
};

exports.get = function(collectionName, entityType, entityId, next) {
  var url = '/entity/' + this.applicationName + "/" + collectionName + "/" + entityType + "/" + entityId;
  getRequest(this.serverHost, this.serverPort, url, next);
};

exports.get = function(collectionName, entityType, next) {
  var url = '/entity/' + this.applicationName + "/" + collectionName + "/" + entityType;
  getRequest(this.serverHost, this.serverPort, url, next);
};

exports.set = function(collectionName, entityType, entityId, object, next) {
  var url = '/entity/' + this.applicationName + "/" + collectionName + "/" + entityType + "/" + entityId;
  postRequest(this.serverHost, this.serverPort, url, object, next);
};

exports.set = function(collectionName, entityType, object, next) {
  var url = '/entity/' + this.applicationName + "/" + collectionName + "/" + entityType;
  postRequest(this.serverHost, this.serverPort, url, object, next);
};

exports.remove = function(collectionName, entityType, entityId, next) {
  var url = '/entity/' + this.applicationName + "/" + collectionName + "/" + entityType + "/" + entityId;
  deleteRequest(this.serverHost, this.serverPort, url, next);
};

function getRequest(serverHost, serverPort, path, next) {
    var options = {
      host: serverHost,
      port: serverPort,
      path: path,
    };

    logger.info("DbService_module: Get - " + JSON.stringify(options));

    var req = http.get(options, function(res) {
      res.setEncoding('utf8');
      res.on('data', function(chunk) {
        if (res.statusCode <= 400 && (!JSON.parse(chunk).error)) {
          next(null, JSON.parse(chunk));
        } else {
          next(JSON.parse(chunk), null);
        }
      });
    });

    req.on('error', function(e) {
      logger.error("DbService_module: http.get error - " + e.stack);
      next(e, null);
    });
};

function postRequest(serverHost, serverPort, path, object, next){
  logger.info("Set entity by id");
  
  var headers = {
    'Content-Type': 'application/json'
  };

  var options = {
    hostname: serverHost,
    port: serverPort,
    path: path,
    method: 'POST',
    headers: headers
  };

  

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      if (res.statusCode <= 400 && (!JSON.parse(chunk).error)) {
          next(null, JSON.parse(chunk));
      } else {
          next(JSON.parse(chunk), null);
      }
    });
  });

  req.on('error', function(e) {
    logger.error("DbService_module: http.post error - " + e.stack);
    next(e, null);
  });
  logger.info("DbService_module: http.post data=" + JSON.stringify(object));
  req.write(JSON.stringify(object));
  req.end();
};

function deleteRequest(serverHost, serverPort, path, next){
  logger.info("Set entity by id");
  var options = {
    hostname: serverHost,
    port: serverPort,
    path: path,
    method: 'DELETE'
  };

  var req = http.request(options, function(res) {
    res.setEncoding('utf8');
    res.on('data', function(chunk) {
      if (res.statusCode <= 400 && (!JSON.parse(chunk).error)) {
          next(null, JSON.parse(chunk));
      } else {
          next(JSON.parse(chunk), null);
      }
    });
  });

  req.on('error', function(e) {
    logger.error("DbService_module: http.delete error - " + e.stack);
    next(e, null);
  });

  req.end();
};