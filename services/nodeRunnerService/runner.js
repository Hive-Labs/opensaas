var fs = require('fs'),
    usage = require('usage');

module.exports = function(app, application, logger) {
    var processStatus = {
        cpu: 0,
        memory: 0,
        runnerPID: -1,
        applicationPID: -1
    };
    var runnerID = app.get('runnerID');

    exports.log = function(callback) {
        fs.readFile('logs/runner' + runnerID + '.log', 'utf8', function(err, data) {
            if (!err) {
                var arrayOfLines = data.match(/[^\r\n]+/g);
                var finalAry = [];
                var MAXNUM = 20;
                for (var i = 0; i < arrayOfLines.length && i < MAXNUM; i++) {
                    try {
                        finalAry.push(JSON.parse(arrayOfLines[i]));
                    } catch (e) {
                        logger.error(e);
                    }
                }
                callback(null, finalAry);
            } else {
                callback(null, "");
            }
        });
    };

    exports.health = function(callback) {
        callback(null, processStatus);
    }

    exports.kill = function() {
        logger.info('info', 'Killing self.');
        process.exit(0);
    }

    exports.updateStatus = function() {
        var runnerPid = process.pid;
        var options = {
            keepHistory: true
        }
        if (application.getNodeProcess()) {
            var applicationPid = application.getNodeProcess().pid;
            usage.lookup(runnerPid, options, function(err1, result1) {
                usage.lookup(applicationPid, options, function(err2, result2) {
                    if (!result2) {
                        logger.error("Could not lookup pid of sub-application.");
                        result2 = {
                            cpu: 0,
                            memory: 0,
                            runnerPID: runnerPid,
                            applicationPID: applicationPid
                        };
                    }
                    processStatus = {
                        cpu: (result1.cpu + result2.cpu),
                        memory: result1.memory + result2.memory,
                        runnerPID: runnerPid,
                        applicationPID: applicationPid
                    }
                });
            });
        } else {
            usage.lookup(runnerPid, options, function(err1, result1) {
                if (result1) {
                    processStatus = {
                        cpu: result1.cpu,
                        memory: result1.memory,
                        runnerPID: runnerPid,
                        applicationPID: -1
                    }
                }
            });
        }
        setTimeout(function() {
            exports.updateStatus();
        }, 3000);
    }



    return exports;
}