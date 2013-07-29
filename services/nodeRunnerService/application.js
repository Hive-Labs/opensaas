/*
 * Module dependencies.
 */

var fs = require('fs'),
  path = require('path'),
  childProcess = require('child_process');

var orchestratorIP;
var runnerID;

exports.init = function(orchestratorIP, runnerID){
  this.orchestratorIP = orchestratorIP;
  this.runnerID = runnerID;
}

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
    console.log(path.resolve(__dirname, "currentApp/" + applicationName));
    //Spawn a process to un-tar this app
    var tarProcess = childProcess.spawn('tar', ['-xvf', newPath + "/app.tar.gz", '-C', newPath]);

    //If there is an error, display it
    tarProcess.on('error', function(err) {
      console.log(err);
    });

    //If there is an error, display it
    tarProcess.stderr.on('data', function(data) {
      console.log('stderr: ' + data);
    });

    tarProcess.stdout.on('data', function(data) {
      console.log('' + data);
    });

    //Once tar process finishes, continue...
    tarProcess.on('close', function(code) {

      //Spawn a new process to run the child node app
      console.log('running: ' + 'orchestratorIP='+ exports.orchestratorIP + ' /usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + applicationName + "/app.js > " + path.resolve(__dirname, "currentApp") + "/" + exports.runnerID +".log"));
      var nodeProcess = childProcess.exec('orchestratorIP='+ exports.orchestratorIP + ' /usr/local/bin/node ' + path.resolve(__dirname, "currentApp/" + applicationName + "/app.js > " + path.resolve(__dirname, "currentApp") + "/" + exports.runnerID +".log"),

      //If child app throws an error or console.logs something, display it


      function(error, stdout, stderr) {
        console.log('stdout: ' + stdout);
        console.log('stderr: ' + stderr);
        if (error !== null) {
          console.log('exec error: ' + error);
        }
      }); //nodeProcess
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