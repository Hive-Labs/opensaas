var fs = require('fs'),
  usage = require('usage');

var runnerID;
var winston;
var processStatus = {};
var application;

exports.init = function(runnerID, application, winston) {
  this.runnerID = runnerID;
  this.winston = winston;
  this.application = application;
}

exports.application = application;
exports.runnerID = runnerID;
exports.winston = winston;
exports.processStatus = processStatus;

exports.readLog = function(callback) {
  fs.readFile('logs/runner' + exports.runnerID + '.log', 'utf8', function(err, data) {
    if (err) throw err;
    var arrayOfLines = data.match(/[^\r\n]+/g);
    var finalAry = [];
    for (var i = 0; i < arrayOfLines.length; i++) {
      finalAry.push(arrayOfLines[i]);
    }
    callback(JSON.stringify(finalAry));
  });
}

exports.getStatus = function(callback) {
  callback(JSON.stringify(exports.processStatus));
}

exports.updateStatus = function() {
  var runnerPid = process.pid;
  var options = {
    keepHistory: true
  }
  if (exports.application.nodeProcess) {
    var applicationPid = exports.application.nodeProcess.pid;
    usage.lookup(runnerPid, options, function(err1, result1) {
      usage.lookup(applicationPid, options, function(err2, result2) {
        if(!result2){
          result2 = {cpu: 0, memory: 0};
        }
        exports.processStatus = {
          cpu: result1.cpu + result2.cpu,
          memory: result1.memory + result2.memory
        }
      });
    });
  } else {
    usage.lookup(runnerPid, options, function(err1, result1) {
      if (result1) {
        exports.processStatus = {
          cpu: result1.cpu,
          memory: result1.memory
        }
      }
      });
    }
}

exports.kill = function() {
  exports.winston.log('info', 'Killing self (as per request)');
  process.exit(0);
}