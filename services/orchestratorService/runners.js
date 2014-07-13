var dbService = require('dbService'),
    SSHClient = require("NodeSSH"),
    request = require('request');

module.exports = function(loadBalancer, settings, logger) {
    var tempRunnerList = [];

    var list = function(only_proxy, callback) {
        logger.log('info', 'runners.list. only_proxy=' + only_proxy);
        if (!only_proxy) {
            callback(null, tempRunnerList);
        } else {
            callback(null, tempRunnerList.filter(function(element) {
                return element.alive;
            }).map(function(element) {
                return {
                    host: element.machine.ip,
                    port: element.machine.runnerPort,
                    appName: element.appName
                };
            }));
        }
    };

    var getRunnerByID = function(runnerID, callback) {
        logger.log('info', 'runners.getRunnerByID');
        list(false, function(err, currentList) {
            for (var i = 0; i < currentList.length; i++) {
                if (currentList[i].id == runnerID) {
                    if (callback)
                        callback(null, currentList[i]);
                    break;
                }
            }
        });
    };

    var updateRunner = function(runnerID, newRunner, callback) {
        logger.log('info', 'runners.updateRunner');
        for (var i = 0; i < tempRunnerList.length; i++) {
            if (tempRunnerList[i].id == runnerID) {
                tempRunnerList[i] = newRunner;
                break;
            }
        }
        if (callback)
            callback();
    };

    var ping = function(runnerID, log, health, callback) {
        logger.log('info', 'runners.ping');
        var pingTime = new Date();
        list(false, function(err, currentList) {
            for (var i = 0; i < currentList.length; i++) {
                if (currentList[i].id == runnerID) {
                    currentList[i].ping = pingTime;
                    currentList[i].log = log;
                    currentList[i].health = health;
                    currentList[i].alive = true;
                    logger.log('info', 'ping runner:' + runnerID + ' @ ' + pingTime);
                    updateRunner(runnerID, currentList[i], callback);
                    break;
                }
            }
        });
    };

    var setAlive = function(runnerID, alive, callback) {
        logger.log('info', 'runners.setAlive');
        if (alive) {
            logger.log('info', 'Setting runner ' + runnerID + ' as alive');
        } else {
            logger.log('info', 'Setting runner ' + runnerID + ' as dead');
        }
        list(false, function(err, currentList) {
            var updatedRunner;
            for (var i = 0; i < tempRunnerList.length; i++) {
                if (currentList[i].id == runnerID) {
                    currentList[i].alive = alive;
                    updatedRunner = currentList[i];
                    break;
                }
            }
            updateRunner(runnerID, updatedRunner, function(err) {
                if (callback)
                    callback(err);
            });
        });
    };

    var add = function(runnerID, runnerName, runnerIP, currMachine, callback) {
        logger.log('info', 'runners.add');
        var runner = {
            id: runnerID,
            name: runnerName,
            ip: runnerIP,
            ping: new Date(),
            alive: false,
            log: "",
            health: {
                cpu: 0,
                memory: 0
            },
            appName: null,
            machine: {
                ip: currMachine.ip,
                runnerPort: currMachine.runnerPort
            }
        };
        tempRunnerList.push(runner);
        logger.log('info', "New runner has been added:" + JSON.stringify(runner));
        if (callback)
            callback(null, runner);
    };

    var getRunnersByApp = function(appName, callback) {
        logger.log('info', 'runners.getRunnersByApp');
        list(false, function(err, currentList) {
            var returnList = [];
            for (var i = 0; i < currentList.length; i++) {
                if (currentList[i].alive === true && currentList[i].appName == appName) {
                    returnList.push(currentList[i]);
                }
            }
            if (callback)
                callback(null, returnList);
        });
    };

    var getAvailableRunner = function(callback) {
        logger.log('info', 'runners.getAvailableRunner');
        list(false, function(err, currentList) {
            var found = false;
            for (var i = 0; i < currentList.length; i++) {
                if (currentList[i].alive === true && currentList[i].appName === null) {
                    if (callback) {
                        callback(null, currentList[i].id);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                logger.log('info', '    getAvailableRunner: No runners were found.');
                if (callback)
                    callback(null, null);
            }
        });
    };

    var removeRunner = function(runnerID, callback) {
        logger.log('info', 'runners.removeRunner');
        getRunnerByID(runnerID, function(err, runner) {
            if (runner) {
                logger.log('info', 'killing' + runner.ip);
                var r = request.del(runner.ip + "/");
                setAlive(runnerID, false, function(err) {
                    if (callback)
                        callback(err);
                });
            } else {
                if (callback)
                    callback('not found');
            }
        });
    };

    var log = function(runnerID, callback) {
        logger.log('info', 'runners.log');
        getRunnerByID(runnerID, function(err, runner) {
            callback(err, runner.log);
        });
    };

    var getHealth = function(runnerID, callback) {
        logger.log('info', 'runners.getHealth');
        getRunnerByID(runnerID, function(err, runner) {
            if (runner) {
                callback(err, runner.health);
            }
        });
    };

    var spawnRunner = function(callback) {
        logger.log('info', 'runners.spawnRunner');
        loadBalancer.nextMachine(function(err, currMachine) {
            var runnerID = generateID();
            var ssh = new SSHClient(currMachine.ip, currMachine.username, currMachine.password);
            var sshCommand = "cd " + currMachine.runnerLocation + " && ORCHESTRATOR_IP=http://" + currMachine.ip + ":" + settings.orchestratorPort + " RUNNER_ID=" + runnerID + " PORT=" + currMachine.runnerPort + " node " + currMachine.runnerLocation + "server.js";
            logger.log('info', 'executing command on remote machine: ' + sshCommand);
            ssh.exec(sshCommand);
            add(runnerID, "someName", "http://" + currMachine.ip + ":" + currMachine.runnerPort, currMachine, function(err, runner) {
                if (callback)
                    callback(err, runner);
            });
        });
    };


    function generateID() {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    }


    exports.spawnRunner = spawnRunner;
    exports.getHealth = getHealth;
    exports.log = log;
    exports.removeRunner = removeRunner;
    exports.getAvailableRunner = getAvailableRunner;
    exports.getRunnersByApp = getRunnersByApp;
    exports.updateRunner = updateRunner;
    exports.add = add;
    exports.setAlive = setAlive;
    exports.ping = ping;
    exports.getRunnerByID = getRunnerByID;
    exports.list = list;

    return exports;
};