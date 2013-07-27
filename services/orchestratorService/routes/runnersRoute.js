var runners,
    applications;

exports.init = function(runners, applications){
  this.runners = runners;
  this.applications = applications;
}

exports.runners = runners;

/*
 * GET users listing.
 */
exports.list = function(req, res) {
  res.send(exports.runners.list());
};


exports.ping = function(req, res) {
  var runnerID = req.body.runnerID;
  exports.runners.ping(runnerID);
  res.send("Runner " + runnerID + " has been pinged");
};

/*
Used to add a server to the list of servers.
Form data: 
  runnerId - the id of the runner being added
  runnerName - the name of the runner added
  runnerIp - the ip of the runner added
*/

exports.add = function(req, res) {
  if (!req.body.runnerID || !req.body.runnerName || !req.body.runnerIp) {
    res.send("You are missing some parameters, you need to specify a runnerId, runnerName, and runnerIp");
  } else {
    var runner = exports.runners.add(req.body.runnerID, req.body.runnerName, req.body.runnerIp);
    res.send("Runner has been added with details: " + JSON.stringify(runner));
  }
};