var runners,
	applications;

exports.runners = runners;

exports.applications = applications;

/*
  Summary:      Expose a method to feed in runners.js reference
  				and applications.js to this file.

  Parameters:   runners - a refrence to require('runners.js')
  				applications - a reference to require('applications.js')
 */
exports.init = function(runners, applications){
	this.runners = runners;
	this.applications = applications;
}


/*
  Summary:      Route to deploy an app to a runner. 
  Parameters  	appName - the name of the app to be deployed.
 */
exports.deploy = function(req, res) {
	exports.applications.add(req.body.appName);
  	res.send('App has been queued. If there are no runners yet, this will take up to 4 minutes.');
};

/*
  Summary:      List all the apps available to deploy
 */
exports.list = function(req, res) {
  exports.applications.listAll(function(data){
    res.end(JSON.stringify(data));
  })
};