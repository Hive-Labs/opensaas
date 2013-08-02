var dbService = require('dbService'),
  request = require('request');

//Until db service is implimented, use this.
var tempRunnerList = [];

/*
  Summary:      External method to feed ip address of dbService into 
                this file
  Parameters:   dbServiceIp - ip address of dbService
 */
exports.init = function(dbServiceIP) {
  dbService.init(dbServiceIP);
}

/*
  Summary:      Get a list of runners (dead or alive)
  Returns:      A list of current runners (dead or alive)
 */
exports.list = function() {
  return tempRunnerList;
};

/*
  Summary:      Get a list of runners (dead or alive)
  Returns:      A list of current runners (dead or alive)
 */
exports.getRunnerByID = function(runnerID) {
  var currentList = exports.list();
  for (var i = 0; i < currentList.length; i++) {
    if (currentList[i].id == runnerID) {
     return currentList[i];
    }
  }
};

/*
  Summary:      Given a runnerID, set its ping time to right now
  Parameters:   runnerID - the id of the runner to ping
 */
exports.ping = function(runnerID) {
  var pingTime = new Date();
  var currentList = exports.list();
  for (var i = 0; i < currentList.length; i++) {
    if (currentList[i].id == runnerID) {
      currentList[i].ping = pingTime;
      currentList[i].alive = true;
      exports.updateRunner(runnerID, currentList[i]);
    }
  }
  console.log('runner ' + runnerID + " was pinged at " + pingTime);
  exports.setAlive(runnerID, true);
};

/*
  Summary:      Set whether a given runner is alive or not
  Parameters:   runnerID - the id of the runner to update
                alive - the status to set on its alive property
 */
exports.setAlive = function(runnerID, alive) {
  var currentList = exports.list();
  var updatedRunner;
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (currentList[i].id == runnerID) {
      currentList[i].alive = alive;
      updatedRunner = currentList[i];
    }
  }
  exports.updateRunner(runnerID, updatedRunner);
}

/*
  Summary:      Add a new runner to the list. By default, it will
                be set as not alive.
  Parameters:   runnerID - the id of the newly created runner
                runnerName - the name of the runner
                runnerIP - the ip address of the new runner
                currMachine - the bare metal machine that this runner is running on
  Returns:      The runner that was just added
 */
exports.add = function(runnerID, runnerName, runnerIP, currMachine) {
  var runner = {
    id: runnerID,
    name: runnerName,
    ip: runnerIP,
    ping: new Date(),
    alive: false,
    appName: null,
    machine: currMachine
  }
  console.log("New runner has been added, but will be marked as dead. I will wait for the runner to ping back.");
  console.log(JSON.stringify(runner));
  tempRunnerList.push(runner);
  return runner;
};

/*
  Summary:      Get a list of runners that match the given appName.
                The returned list will be a list of alive runners.
  Parameters:   appName - the name of the app to look for that runners match
  Returns:      A list of runners that match the given app name
 */
exports.getRunnersByApp = function(appName) {
  var currentList = exports.list();
  var returnList = [];
  for (var i = 0; i < currentList.length; i++) {
    if (currentList[i].alive == true && currentList[i].appName == appName) {
      returnList.push(currentList[i]);
    }
  }
  return returnList;
}

/*
  Summary:      Looks for a runner that is alive and is not running any apps
  Returns:      A runner that is alive and is not running an app.
 */
exports.getAvailableRunner = function() {
  var currentList = exports.list();
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (currentList[i].alive == true && currentList[i].appName == null) {
      return currentList[i].id;
    }
  }
  return null;
}

/*
  Summary:      Update a runner with the given values
  Parameters:   runnerID - the id of the runner to change values for
                newRunner - the new JSON configuration of the runner
                            in the same format as old runner.
 */
exports.updateRunner = function(runnerID, newRunner) {
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (tempRunnerList[i].id == runnerID) {
      tempRunnerList[i] = newRunner;
      break;
    }
  }
}

/*
  Summary:      Removes a runner with the given id from table.
                To be safe, it will send a kill command to the runner
                before removing it from the list.
  Parameters:   runnerID - the id of the runner to kill and remove
 */
exports.removeRunner = function(runnerID) {
  for (var i = 0; i < tempRunnerList.length; i++) {
    console.log('i:' + i);
    if (tempRunnerList[i].id == runnerID) {
      console.log('posting to ' + tempRunnerList[i].ip);
      var r = request.post(tempRunnerList[i].ip + "/runner/kill");
      console.log('done posting...');
      tempRunnerList.splice(i, 1);
      break;
    }
  }
}

exports.log = function(runnerID, callback){
  for (var i = 0; i < tempRunnerList.length; i++) {
    if (tempRunnerList[i].id == runnerID) {
      request.get(tempRunnerList[i].ip + "/runner/log", function (error, response, body) {
        callback(response);
      });
      break;
    }
  }

}