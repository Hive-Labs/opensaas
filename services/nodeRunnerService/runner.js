var fs = require('fs');
var runnerID;
var winston;

exports.init = function(runnerID, winston){
	this.runnerID = runnerID;
  this.winston = winston;
}

exports.runnerID = runnerID;
exports.winston = winston;

exports.readLog = function(callback) {
  fs.readFile('logs/runner' + exports.runnerID + '.log', 'utf8', function(err, data) {
    if (err) throw err;
    var arrayOfLines = data.match(/[^\r\n]+/g);
    var finalAry = [];
    for(var i = 0; i<arrayOfLines.length; i++){
    	finalAry.push(arrayOfLines[i]);
    }
    callback(JSON.stringify(finalAry));
  });
}

exports.kill = function(){
  exports.winston.log('info', 'Killing self (as per request)');
  process.exit(0);
}