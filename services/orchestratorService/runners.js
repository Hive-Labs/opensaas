var dbService = require('dbService'),
  request = require('request');

//Until db service is implimented, use this.
var tempRunnerList = [];

exports.init = function(dbServiceIP) {
  dbService.init(dbServiceIP);
}

/*
 * Get a list of active runners from database 
 */
exports.list = function() {
  //return dbService.get('runners', 'runner');;
  return tempRunnerList;
};

/*
 * Update this specific runner in the database
 * with this current time of ping.
 */
exports.ping = function(runnerId) {
  var pingTime = new Date();
  var currentList = exports.list();
  for (var i = 0; i < currentList.length; i++) {
    if (currentList[i].id == runnerId) {
      currentList[i].ping = pingTime;
      currentList[i].alive = true;
      exports.updateRunner(runnerId, currentList[i]);
    }
  }
  console.log('runner ' + runnerId + " was pinged at " + pingTime);
  exports.setAlive(runnerId, true);
};

exports.setAlive = function(runnerId, status) {
  var currentList = exports.list();
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (currentList[i].id == runnerId) {
      currentList[i].alive = status;
    }
  }
}

/*
 * Add a new runner to the database
 */
exports.add = function(runnerId, runnerName, runnerIp) {
  var runner = {
    id: runnerId,
    name: runnerName,
    ip: runnerIp,
    ping: new Date(),
    alive: false,
    appName: null
  }
  console.log("New runner has been added, but will be marked as dead. I will wait for the runner to ping back.");
  console.log(runner);
  currentRunners = exports.list();
  currentRunners.push(runner);
  //dbService.set('runners', runner);
  tempRunnerList = currentRunners;
  return runner;
};

exports.getRunnersByApp = function(appName){
   var currentList = exports.list();
   var returnList = [];
  for (var i = 0; i < currentList.length; i++) {
    if (currentList[i].alive == true && currentList[i].appName == appName) {
      returnList.push(currentList[i]);
    }
  }
  return returnList;
}

exports.getAvailableRunner = function() {
  var currentList = exports.list();
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (currentList[i].alive == true && currentList[i].appName == null) {
      return currentList[i].id;
    }
  }
  return null;
}

exports.updateRunner = function(runnerId, newRunner) {
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (tempRunnerList[i].id == runnerId) {
      tempRunnerList[i] = newRunner;
      break;
    }
  }
}

exports.removeRunner = function(runnerId) {
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (tempRunnerList[i].id == runnerId) {
      var r = request.post(tempRunnerList[i].ip + "/runner/kill")
      setTimeout(function callback(){
        tempRunnerList.splice(i, 1);
        console.log('Removing old runner from list');
      }, 5000);
      break;
    }
  }
}