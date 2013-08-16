var runners,
    applications;

exports.runners = runners;

/*
  Summary:      Expose a method to feed in runners.js reference
                and applications.js to this file.

  Parameters:   runners - a refrence to require('runners.js')
                applications - a reference to require('applications.js')
 */
exports.init = function(runners, applications){
  this.runners = runners;
  this.applications = applications;
};

/*
  Summary:      Route to GET /runners/list. Returns the list of runners
                dead or alive.
 */
exports.list = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send(exports.runners.list());
};

/*
  Summary:      Route to GET /runners/HAlist. Returns the list of runners
                dead or alive.
 */
exports.HAlist = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send(exports.runners.list(true));
};

/*
  Summary:      Route to GET /runners/list. Returns the list of runners
                dead or alive.
 */
exports.spawn = function(req, res) {
  res.header("Access-Control-Allow-Origin", "*");
  res.send('A new runner has been spawned. Please wait for it to appear.');
  exports.runners.spawnRunner();
};

/*
  Summary:      Route to POST /runners/ping. 
  Parameters:   runnerID - the id of the runner to be marked as pinged
                           at the current time.
 */
exports.ping = function(req, res) {
  var runnerID = req.body.runnerID;
  exports.runners.ping(runnerID);
  res.send("Runner " + runnerID + " has been pinged");
};


/*
  Summary:      Route to POST /runners/add. 
  Parameters:   runnerID - the id of the new runner
                runnerIP - the ip of the runner to be created.
                runnerName - the name of the new runner to be created
 */
exports.add = function(req, res) {
  if (!req.body.runnerID || !req.body.runnerName || !req.body.runnerIp || !req.body.machine) {
    res.send("You are missing some parameters, you need to specify a runnerId, runnerName, runnerIp, and machine");
  } else {
    var runner = exports.runners.add(req.body.runnerID, req.body.runnerName, req.body.runnerIp, req.body.machine);
    res.send("Runner has been added with details: " + JSON.stringify(runner));
  }
};

/*
  Summary:      Route to DELETE /runners/runner. This will kill a runner and 
                remove it from the list.
  Parameters    id - the id of the runner to be removed.
 */
exports.removeRunner= function(req, res) {
  if (!req.params.id) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send("You are missing some parameters bro, you need to specify a id.");
  } else {
    var runner = exports.runners.removeRunner(req.params.id);
    res.header("Access-Control-Allow-Origin", "*");
    res.send("Runner has been removed.");
  }
};

exports.log= function(req, res) {
  if (!req.params.id) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send("You are missing some parameters, you need to specify an id.");
  } else {
    var runner = exports.runners.log(req.params.id, function callback(data){
      res.header("Access-Control-Allow-Origin", "*");
      res.send(data.body);
    });
  }
};


exports.status= function(req, res) {
  if (!req.params.id) {
    res.header("Access-Control-Allow-Origin", "*");
    res.send("You are missing some parameters, you need to specify an id.");
  } else {
    var runner = exports.runners.status(req.params.id, function callback(data){
      res.header("Access-Control-Allow-Origin", "*");
      if(data){
         res.send(data.body);        
      }
      else{
        res.send(JSON.stringify({cpu: 0, memory: 0}));
      }
    });
  }
};


