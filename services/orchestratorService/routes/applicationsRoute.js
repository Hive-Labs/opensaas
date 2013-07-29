var runners;
var applications;

exports.init = function(runners, applications){
	this.runners = runners;
	this.applications = applications;
}

exports.runners = runners;

exports.applications = applications;

exports.deploy = function(req, res) {
	exports.applications.add(req.body.appName);
  	res.send('App has been queued. If there are no runners yet, this will take up to 4 minutes.');
};