var fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process');

module.exports = function(app, logger) {
  var orchestratorIP = app.get('orchestratorIP');
  var currentPort = app.get('port');
  var runnerID = app.get('runnerID');
  var nodeProcess;
  exports.nodeProcess = nodeProcess;
  exports.kill = function(callback) {
    logger.log('application/kill');
    if (nodeProcess) {
      logger.log('info', 'Killing child app');
      nodeProcess.kill('SIGQUIT');
    }
    callback();
  }

  exports.start = function(applicationTar, applicationName, callback) {
    logger.log('application/start');
    fs.readFile(applicationTar.path, function(err, data) {
      //Save the applicationTar to a tar.gz file in the local filesystem
      var newPath = path.resolve(__dirname, "currentApp");
      fs.writeFileSync(newPath + "/app.tar.gz", data);

      //Delete any pre-existing version of this app
      deleteFolderRecursive(newPath + "/" + applicationName);
      logger.log('info', 'RUNNER:' + path.resolve(__dirname, "currentApp/" + applicationName));
      //Spawn a process to un-tar this app
      var tarProcess = childProcess.spawn('tar', ['-xvf', newPath + "/app.tar.gz", '-C', newPath]);

      //If there is an error, display it
      tarProcess.on('error', function(err) {
        logger.log('info', 'Error Untarring:' + err);
      });

      //If there is an error, display it
      tarProcess.stderr.on('data', function(data) {
        logger.log('info', 'Error Untarring: ' + data);
      });

      tarProcess.stdout.on('data', function(data) {
        logger.log('info', 'RUNNER:' + data);
      });

      //Once tar process finishes, continue...
      tarProcess.on('close', function(code) {
        logger.log('info', path.resolve(__dirname, "currentApp/" + applicationName + "/"));
        var npmProcess = childProcess.spawn('/usr/local/bin/npm', ['install'], {
          cwd: path.resolve(__dirname, "currentApp/" + applicationName + "/")
        });

        //If there is an error, display it
        npmProcess.on('error', function(err) {
          logger.log('info', 'Error npm:' + err);
        });

        //If there is an error, display it
        npmProcess.stderr.on('data', function(data) {
          logger.log('info', 'Error npm: ' + data);
        });

        npmProcess.stdout.on('data', function(data) {
          logger.log('info', 'RUNNER:' + data);
        });

        npmProcess.on('close', function(code) {
          //Spawn a new process to run the child node app
          logger.log('info', 'RUNNER:running: ' + '/usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + applicationName + "/app.js"));
          var envCopy = [];
          envCopy['orchestratorIP'] = orchestratorIP;
          envCopy['SUBPORT'] = (parseInt(currentPort) + 1000);
          nodeProcess = childProcess.spawn('/usr/local/bin/node', [path.resolve(__dirname, "currentApp/" + applicationName + "/app.js")], {
            env: envCopy,
            cwd: path.resolve(__dirname, "currentApp/" + applicationName + "/")
          });
          //If child app throws an error or console.logs something, display it
          nodeProcess.on('error', function(err) {
            logger.log('info', 'Error childapp:' + err);
          });

          nodeProcess.stderr.on('data', function(data) {
            logger.log('info', 'Error childapp:' + data);
          });

          nodeProcess.stdout.on('data', function(data) {
            logger.log('info', 'CHILD:' + data);
          });
          callback(null, {
            appName: applicationName
          });
        }); //npmProcess.on(close)
      }); //tarProcess.on(close)
    }); //fs.readFile
  }; //exports.start

  function deleteFolderRecursive(path) {
    logger.log('application/deleteFolderRecursive');
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