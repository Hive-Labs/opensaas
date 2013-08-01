var dbService = require('dbService'),
	request = require('request'),
	path = require('path'),
	fs = require('fs'),
	runners;

//Temporary method of storing app list
var tempApplicationList = [];

exports.runners = runners;

/*
  Summary:      External method to feed ip address of dbService and runners.js
   				into this file.
  Parameters:   dbServiceIp - ip address of dbService
  				runners - a refrence to require('runners.js')
 */
exports.init = function(dbServiceIP, runners) {
	dbService.init(dbServiceIP);
	this.runners = runners;
}

/*
  Summary:      Get a list of apps currently deployed or waiting 
  				to be deployed on runners.
  Returns: 		A list of apps as javascript array
 */
exports.list = function() {
	return tempApplicationList;
};

/*
  Summary:      Add a new app to the list to be queued.
  				Then, try to deploy it.
  Parameters:   appName - the name of the app (case sensitive)
 */
exports.add = function(appName) {
	var currentList = exports.list();
	if (currentList.indexOf(appName) == -1) {
		tempApplicationList.push(appName);
		console.log(tempApplicationList);
		exports.deployApps(exports.list());
	}
};

/*
  Summary:      Deploy a list of apps to available runners. 
  				If a runner is not available, wait until there is one.

  Parameters:   appList - A javascript array of app names to be deployed.
 */

exports.deployApps = function(appList) {
	var availableRunner = exports.runners.getAvailableRunner();
	if (availableRunner) {
		for (var i = 0; i < appList.length; i++) {
			if (!exports.runners.getRunnersByApp(appList[i]) || exports.runners.getRunnersByApp(appList[i]).length == 0) {
				console.log('Deploying ' + appList[i]);
				exports.deploy(appList[i]);
			}
		}
	}
	else{
		setTimeout(function(){exports.deployApps(appList)}, 10000);
	}
}

/*
  Summary:      DO NOT CALL THIS METHOD. THIS IS USED INTERNALLY.
  				[Deploy an app to an available runner]

  Parameters:   appName - the name of the app to be deployed.
 */

exports.deploy = function(appName) {
	var currentList = exports.runners.list();
	if (currentList.length > 0) {
		var availableRunner = exports.runners.getAvailableRunner();
		if (availableRunner) {
			var runnerIp;
			for (var i = 0; i < currentList.length; i++) {
				if (currentList[i].id == availableRunner) {
					currentList[i].appName = appName;
					exports.runners.updateRunner(currentList[i].id, currentList[i]);
					runnerIp = currentList[i].ip;
					console.log(currentList[i].ip);
					break;
				}
			}
			console.log(path.join(__dirname, 'apps/' + appName + ".tar.gz"));
			var r = request.post(runnerIp + "/application/start")
			var form = r.form()
			form.append('applicationTar', fs.createReadStream(path.join(__dirname, 'apps/' + appName + ".tar.gz")));
			form.append('applicationName', appName);
		}
	}
}

