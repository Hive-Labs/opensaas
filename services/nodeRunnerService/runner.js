var fs = require('fs');
var runnerID;

exports.init = function(runnerID){
	this.runnerID = runnerID;
}
exports.runnerID = runnerID;
exports.readLog = function(callback) {
  fs.readFile('runner' + exports.runnerID + '.log', 'utf8', function(err, data) {
    if (err) throw err;
    callback(data);
  });
}