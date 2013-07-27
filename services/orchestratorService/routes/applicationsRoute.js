var runners;
var applications;

exports.init = function(runners, applications){
	this.runners = runners;
	this.applications = applications;
}

exports.runners = runners;

exports.applications = applications;

exports.deploy = function(req, res) {
	exports.applications.deploy(req.body.appName);	
  	res.send('App has been deployed, it will show up soon.');
};