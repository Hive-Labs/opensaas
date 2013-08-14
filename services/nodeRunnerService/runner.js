var fs = require('fs'),
usage = require('usage');

  var runnerID;
  var winston;
  var processStatus = {};

exports.init = function(runnerID, winston) {
  this.runnerID = runnerID;
  this.winston = winston;
}

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
  var pid = process.pid;
  var options = { keepHistory: true }
  usage.lookup(pid, options, function(err, result) {
    exports.processStatus = result;
  });
}

exports.kill = function() {
  exports.winston.log('info', 'Killing self (as per request)');
  process.exit(0);
}