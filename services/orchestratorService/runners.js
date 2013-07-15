var dbService = require('dbService');

/*
 * Get a list of active runners from database
 */
exports.list = function() {
  var runnerList = [{
    id: '0',
    appName: 'Notebook',
    ip: '192.168.15.10',
    ping: new Date()
  }, {
    id: '1',
    appName: 'Book Trade',
    ip: '192.168.15.11',
    ping: new Date()
  }]
  return runnerList;
};

/*
 * Update this specific runner in the database
 * with this current time of ping.
 */
exports.ping = function(runnerId) {

};

/*
 * Add a new runner to the database
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