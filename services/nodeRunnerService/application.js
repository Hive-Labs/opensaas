var fs = require('fs'),
    path = require('path'),
    childProcess = require('child_process');

module.exports = function(app, logger) {
    var orchestratorIP = app.get('orchestratorIP');
    var currentPort = app.get('port');
    var runnerID = app.get('runnerID');
    var nodeProcess;

    exports.getNodeProcess = function() {
        return app.get("applicationNodeProcess");
    };

    exports.kill = function(callback) {
        logger.info('application/kill');
        if (nodeProcess) {
            logger.info('Killing child app');
            nodeProcess.kill('SIGQUIT');
        }
        callback();
    }

    exports.start = function(applicationTar, applicationName, callback) {
        logger.info('application/start');
        fs.readFile(applicationTar.path, function(err, data) {
            //Save the applicationTar to a tar.gz file in the local filesystem
            var newPath = path.resolve(__dirname, "currentApp/" + runnerID);
            fs.writeFileSync(newPath + "/app.tar.gz", data);

            //Delete any pre-existing version of this app
            deleteFolderRecursive(newPath + "/" + applicationName);
            logger.info('RUNNER:' + path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName));
            //Spawn a process to un-tar this app
            var tarProcess = childProcess.spawn('tar', ['-xvf', newPath + "/app.tar.gz", '-C', newPath]);

            //If there is an error, display it
            tarProcess.on('error', function(err) {
                logger.info('Tar:' + err);
            });

            //If there is an error, display it
            tarProcess.stderr.on('data', function(data) {
                logger.info('Tar: ' + data);
            });

            tarProcess.stdout.on('data', function(data) {
                logger.info('Tar:' + data);
            });

            //Once tar process finishes, continue...
            tarProcess.on('close', function(code) {
                logger.info(path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/"));
                var npmProcess = childProcess.spawn('/usr/local/bin/npm', ['install'], {
                    cwd: path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/")
                });

                //If there is an error, display it
                npmProcess.on('error', function(err) {
                    logger.info('Npm:' + err);
                });

                //If there is an error, display it
                npmProcess.stderr.on('data', function(data) {
                    logger.info('Npm: ' + data);
                });

                npmProcess.stdout.on('data', function(data) {
                    logger.info('Npm:' + data);
                });

                npmProcess.on('close', function(code) {
                    //Spawn a new process to run the child node app
                    logger.info("RUNNER: Checking if exists..." + path.resolve(__dirname, "currentApp/" + applicationName + "/app.js"));
                    if (fs.existsSync(path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/app.js"))) {
                        logger.info('RUNNER:running: ' + '/usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/app.js"));
                        var envCopy = [];
                        envCopy['orchestratorIP'] = orchestratorIP;
                        envCopy['SUBPORT'] = (parseInt(currentPort) + 1000);
                        this.nodeProcess = childProcess.spawn('/usr/local/bin/node', [path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/app.js")], {
                            env: envCopy,
                            cwd: path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/")
                        });
                    } else {
                        logger.info('RUNNER:running: ' + '/usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/main.js"));
                        config = require(path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/runnerConfig.json"));
                        var envCopy = [];
                        envCopy['MONGO_URL'] = config.MONGO_URL;
                        envCopy['ROOT_URL'] = config.ROOT_URL;
                        envCopy['PORT'] = (parseInt(currentPort) + 1000);
                        envCopy['PATH'] = process.env.PATH;

                        this.nodeProcess = childProcess.spawn('/usr/local/bin/node', [path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/main.js")], {
                            env: envCopy,
                            cwd: path.resolve(__dirname, "currentApp/" + runnerID + "/" + applicationName + "/")
                        });
                    }

                    //If child app throws an error or console.logs something, display it
                    this.nodeProcess.on('error', function(data) {
                        if (data) {
                            logger.error('CHILD:' + data);
                        }
                    });

                    this.nodeProcess.stderr.on('data', function(data) {
                        if (data) {
                            logger.error('CHILD:' + data);
                        }
                    });

                    this.nodeProcess.stdout.on('data', function(data) {
                        if (data) {
                            logger.info('CHILD:' + data);
                        }
                    });
                    app.set("applicationNodeProcess", this.nodeProcess);
                    callback(null, {
                        appName: applicationName
                    });
                }); //npmProcess.on(close)
            }); //tarProcess.on(close)
        }); //fs.readFile
    }; //exports.start

    function deleteFolderRecursive(path) {
        logger.info('application/deleteFolderRecursive');
        if (fs.existsSync(path)) {
            fs.readdirSync(path).forEach(function(file, index) {
                var curPath = path + "/" + file;
                if (fs.statSync(curPath).isDirectory()) { // recurse
                    deleteFolderRecursive(curPath);
                } else { // delete file
                    fs.unlinkSync(curPath);
                }
            });
            fs.rmdirSync(path);
        }
    };

    return exports;
}