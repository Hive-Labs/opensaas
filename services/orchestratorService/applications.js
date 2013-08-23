var request = require('request'),
    path = require('path'),
    fs = require('fs');

module.exports = function(runners, settings, logger) {
    var tempApplicationList = [];
    console.log(runners);

    var listDeployed = function(callback) {
            logger.log('info', 'applications.listDeployed');
            if (callback) callback(null, tempApplicationList);
        };


    var listAvailable = function(callback) {
            logger.log('info', 'applications.listAvailable');
            fs.readdir('./apps', function(err, files) {
                var finalResult = [];
                var i;
                for (i = 0; i < files.length; i++) {
                    files[i] = files[i].replace('.tar.gz', '');
                    if (files[i].indexOf('.') !== 0) {
                        finalResult.push(files[i]);
                    }
                }
                if (callback) callback(null, finalResult);
            });
        };

    var deploy = function(appName) {
            logger.log('info', 'applications.deploy');
            runners.list(false, function(err, currentList) {
                if (currentList.length > 0) {
                    runners.getAvailableRunner(function(err, availableRunner) {
                        if (availableRunner) {
                            logger.log('info', 'Available runner found. Deploying app: ' + appName);
                            var runnerIp;
                            for (var i = 0; i < currentList.length; i++) {
                                if (currentList[i].id == availableRunner) {
                                    console.log('appName: ' + appName);
                                    currentList[i].appName = appName;
                                    runners.updateRunner(currentList[i].id, currentList[i]);
                                    runnerIp = currentList[i].ip;
                                    break;
                                }
                            }
                            var r = request.put(runnerIp + "/application");
                            var form = r.form();
                            form.append('applicationTar', fs.createReadStream(path.join(__dirname, 'apps/' + appName + ".tar.gz")));
                            form.append('applicationName', appName);
                        }
                    });
                }
            });
        };

    var deployApps = function(appList) {
            logger.log('info', 'applications.deployApps');
            runners.getAvailableRunner(function(err, availableRunner) {
                if (availableRunner) {
                    for (var i = 0; i < appList.length; i++) {
                        checkApp(appList[i].appName, appList[i].count);
                    }
                } else {
                    logger.log('info', 'There are no available runners.');
                    setTimeout(function() {
                        deployApps(appList);
                    }, 10000);
                }
            });
        };

    function checkApp(appName, count) {
        runners.getRunnersByApp(appName, function(err, appRunnerList) {
            if (!appRunnerList || appRunnerList.length < count) {
                deploy(appName);
            }
        });
    }
    var queue = function(appName, callback) {
            logger.log('info', 'applications.queue');
            listDeployed(function(err, currentList) {
                var exists = false;
                var i;
                for (i = 0; i < tempApplicationList.length; i++) {
                    if (tempApplicationList[i].appName == appName) {
                        exists = true;
                        //increment the number of runners to deploy this app on
                        tempApplicationList[i].count++;
                        if (callback) callback(null, tempApplicationList[i]);
                    }
                }
                if (!exists) {
                    var application = {
                        appName: appName,
                        count: 1
                    };
                    tempApplicationList.push(application);
                    if (callback) callback(null, application);
                }
                listDeployed(function(err, appList) {
                    deployApps(appList);
                });
            });
        };


    exports.listDeployed = listDeployed;
    exports.listAvailable = listAvailable;
    exports.deployApps = deployApps;
    exports.queue = queue;

    return exports;
};