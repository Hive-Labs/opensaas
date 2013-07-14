var dbService = require('dbService');
/*
 * GET users listing.
 */
exports.list = function() {
  var runnerList = [{
      id: '0'
      ,appName: 'Notebook'
      ,ip: '192.168.15.10'
      ,ping: new Date()
    },
    {
      id: '1'
      ,appName: 'Book Trade'
      ,ip: '192.168.15.11'
      ,ping: new Date()
    }
    ]
  return runnerList;
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