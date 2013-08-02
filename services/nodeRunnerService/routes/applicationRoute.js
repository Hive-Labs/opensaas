var application;

exports.init = function(application){
	this.application = application;
}
  
exports.application = application;
  
/*
 * GET users listing.
 */
exports.start = function(req, res) {
  
 exports.application.start(req.files.applicationTar, req.body.applicationName);
 res.end('Done deploying application');
};


