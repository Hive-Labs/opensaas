var fs = require('fs'),
  usage = require('usage');

module.exports = function(app, application, logger) {
  var processStatus = {};
  var runnerID = app.get('runnerID');

  exports.log = function(callback) {
    logger.log('runner/log');
    fs.readFile('logs/runner' + runnerID + '.log', 'utf8', function(err, data) {
      if (err) throw err;
      var arrayOfLines = data.match(/[^\r\n]+/g);
      var finalAry = [];
      for (var i = 0; i < arrayOfLines.length; i++) {
        finalAry.push(JSON.parse(arrayOfLines[i]));
      }
      callback(null, finalAry);
    });
  }

  exports.health = function(callback) {
    logger.log('runner/health');
    callback(null, processStatus);
  }

  exports.kill = function() {
    logger.log('runner/kill');
    logger.log('info', 'Killing self.');
    process.exit(0);
  }

  exports.updateStatus = function() {
    logger.log('info', 'runner/updateStatus');
    var runnerPid = process.pid;
    var options = {
      keepHistory: true
    }
    if (application.nodeProcess) {
      var applicationPid = application.nodeProcess.pid;
      usage.lookup(runnerPid, options, function(err1, result1) {
        usage.lookup(applicationPid, options, function(err2, result2) {
          if (!result2) {
            result2 = {
              cpu: 0,
              memory: 0
            };
          }
          processStatus = {
            cpu: result1.cpu + result2.cpu,
            memory: result1.memory + result2.memory
          }
        });
      });
    } else {
      usage.lookup(runnerPid, options, function(err1, result1) {
        if (result1) {
          processStatus = {
            cpu: result1.cpu,
            memory: result1.memory
          }
        }
      });
    }
    setTimeout(function(){
      exports.updateStatus();
    }, 3000);
  }

  

  return exports;
}