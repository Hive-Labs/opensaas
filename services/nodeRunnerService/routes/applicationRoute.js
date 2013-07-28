var application = require('../application');
  
  
/*
 * GET users listing.
 */
exports.start = function(req, res) {
  
 application.start(req.files.applicationTar, req.body.applicationName);
 res.end('Done deploying application');
};


