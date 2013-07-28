//var dbService = require('dbService'),
var request = require('request');
var orchestratorIP;

exports.init = function(orchestratorIP) {
  this.orchestratorIP = orchestratorIP;
}
exports.orchestratorIP = orchestratorIP;
/*
 * GET users listing.
 */
exports.list = function(callback) {
  console.log(callback);
  request(exports.orchestratorIP + "/runners/list", function(error, response, body) {
    if (!error) {
      console.log(callback);
      callback(JSON.parse(body));
    }
  })
};


exports.ping = function(runnerId) {

};

/*
Used to add a server to the list of servers.
Form data: 
  runnerId - the id of the runner being added
  runnerName - the name of the runner added
  runnerIp - the ip of the runner added
*/

exports.add = function(runnerId, runnerName, runnerIp) {
  var runner = {
    id: runnerId,
    name: runnerName,
    ip: runnerIp,
    ping: new Date()
  }
  currentRunners = dbService.get('runners', 'runner');
  currentRunners.push(runner);
  dbService.set('runners', runner);
  return runner;
};