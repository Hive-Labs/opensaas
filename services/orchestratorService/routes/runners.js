
/*
 * GET users listing.
 */
exports.list = function(req, res){
  res.send("respond with a resource");
};


exports.ping = function(req, res){
  var runnerId = req.body.runnerId;
  res.send("Runner " + runnerId +" has been pinged");
};