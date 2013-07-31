/*
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process');

var orchestratorIP;
var runnerID;
var winston;
exports.init = function(orchestratorIP, runnerID, winston) {
  this.orchestratorIP = orchestratorIP;
  this.runnerID = runnerID;
  this.winston = winston;
}

exports.winston = winston;
exports.orchestratorIP = orchestratorIP;
exports.runnerID = runnerID;
/*
 * Host a new application.
 * applicationTar: The req.file of the request
 * applicationName: The name of the application being uploaded
 */
exports.start = function(applicationTar, applicationName) {
  fs.readFile(applicationTar.path, function(err, data) {
    //Save the applicationTar to a tar.gz file in the local filesystem
    var newPath = path.resolve(__dirname, "currentApp");
    fs.writeFileSync(newPath + "/app.tar.gz", data);

    //Delete any pre-existing version of this app
    deleteFolderRecursive(newPath + "/" + applicationName);
    exports.winston.log('info', 'RUNNER:' + path.resolve(__dirname, "currentApp/" + applicationName));
    //Spawn a process to un-tar this app
    var tarProcess = childProcess.spawn('tar', ['-xvf', newPath + "/app.tar.gz", '-C', newPath]);

    //If there is an error, display it
    tarProcess.on('error', function(err) {
      exports.winston.log('info', 'RUNNER:' + err);
    });

    //If there is an error, display it
    tarProcess.stderr.on('data', function(data) {
      exports.winston.log('info', 'RUNNER:stderr: ' + data);
    });

    tarProcess.stdout.on('data', function(data) {
      exports.winston.log('info', 'RUNNER:' + data);
    });

    //Once tar process finishes, continue...
    tarProcess.on('close', function(code) {
      //Spawn a new process to run the child node app
      exports.winston.log('info', 'RUNNER:running: ' + '/usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + applicationName + "/app.js"));
      var envCopy = [];
      envCopy['orchestratorIP']=exports.orchestratorIP;
      var nodeProcess = childProcess.spawn('/usr/local/bin/node', [path.resolve(__dirname, "currentApp/" + applicationName + "/app.js")], {env : envCopy});
      //If child app throws an error or console.logs something, display it
      nodeProcess.on('error', function(err) {
        exports.winston.log('info', 'CHILD:' + err);
      });

      nodeProcess.stderr.on('data', function(data) {
        exports.winston.log('info', 'CHILD:' + data);
      });

      nodeProcess.stdout.on('data', function(data) {
        exports.winston.log('info', 'CHILD:' + data);
      });

      }); //tarProcess.on(close)
    }); //fs.readFile
  }; //exports.start
  ////////////////////////INTERNAL METHODS//////////////
  var deleteFolderRecursive = function(path) {
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