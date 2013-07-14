var runners = require('../runners');
/*
 * GET users listing.
 */
exports.list = function(req, res) {
  res.send("respond with a resource");
  return runners.list();
};


exports.ping = function(req, res) {
  var runnerId = req.body.runnerId;
  runners.ping(runnerId);
  res.send("Runner " + runnerId + " has been pinged");
};

/*
Used to add a server to the list of servers.
Form data: 
  runnerId - the id of the runner being added
  runnerName - the name of the runner added
  runnerIp - the ip of the runner added
*/

exports.add = function(req, res) {
  if (!req.body.runnerId || !req.body.runnerName || !req.body.runnerIp) {
    res.send("You are missing some parameters, you need to specify a runnerId, runnerName, and runnerIp");
  } else {
    var runner = runners.add(req.body.runnerId, req.body.runnerName, req.body.runnerIp);
    res.send("Runner has been added with details: " + JSON.stringify(runner));
  }
};