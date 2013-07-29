/*
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  dbService = require('dbService'),
  runnersRoute = require('./routes/runnersRoute'),
  applicationsRoute = require('./routes/applicationsRoute'),
  runners = require('./runners'),
  applications = require('./applications'),
  http = require('http'),
  path = require('path'),
  SSHClient = require("NodeSSH");
Expect = require('node-expect');
fs = require('fs');

var app = express();
app.set('port', process.env.PORT || 2000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

applicationsRoute.init(runners, applications);
runnersRoute.init(runners, applications);


// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

// Read the configuration file
parseConfigurationFile();

//Setup the routes for accessing runner information
app.get('/', routes.index);
app.get('/runners/list', runnersRoute.list);
app.post('/runners/ping', runnersRoute.ping);
app.post('/runners/add', runnersRoute.add);
app.post('/runners/remove', runnersRoute.removeRunner);
app.post('/applications/deploy', applicationsRoute.deploy);

//Start listening for route requests
http.createServer(app).listen(app.get('port'), function() {
  console.log('Orchestrator Service listening on port ' + app.get('port'));
});

//Refresh the runner list
var runnerList = runners.list();

//The list of bare metal machines you have access to
var bareMetalList;
var currentRoundRobinIndex = 0;

//Deploy all the apps in the list


/* Monitor every runner and throw an error if 
runner has been inactive for more than five minutes */
var runnerIndex = 0;
var TIMEOUT_TIME = 3 * 60 * 1000; /* ms */
monitorRunners();


/////////////////////////Internal methods////////////////////

function parseConfigurationFile() {
  if (!fs.existsSync("./ServerConfiguration.json")) {
    throw new Error('Server configuration file has not been specified. I am checking process.env.SERVERCONF');
  }
  //Read the file and initialize the dbService
  var data = fs.readFileSync("./ServerConfiguration.json", 'utf8');

  data = JSON.parse(data);
  //Initialize the dbServer module with the ip address and application name
  dbService.init(data.dbService, "OrchestratorService");
  runners.init(data.dbService);
  applications.init(data.dbService, runners);
  bareMetalList = data.bareMetalMachines;
}

function spawnRunner(runnerId) {
  console.log('New runner being spawned.');
  if (runnerId) {
    runners.removeRunner(runnerId);
  } else {
    runnerId = s4();
  }
  var currMachine = bareMetalList[currentRoundRobinIndex];
  var ssh = new SSHClient(currMachine.ip, currMachine.username, currMachine.password);
  ssh.exec("RUNNER_ID=" + runnerId + " PORT=" + currMachine.runnerPort +" node " + currMachine.runnerLocation + " > \"runner" + runnerId + ".log\"");
  console.log("RUNNER_ID=" + runnerId + " PORT=" + currMachine.runnerPort +" node " + currMachine.runnerLocation + " > \"runner" + runnerId + ".log\"");
  //Assume that it will take max 10 seconds for the new runner to be spawned.
  runners.add(runnerId, "someName", "http://" + currMachine.ip + ":" + currMachine.runnerPort, false);
  currentRoundRobinIndex++;
  if (currentRoundRobinIndex >= bareMetalList.length) currentRoundRobinIndex = 0;
}

function monitorRunners() {
  if (runners.getAvailableRunner() && runnerList && runnerList.length > 0) {
    if (runnerList[runnerIndex] && (new Date) - runnerList[runnerIndex].ping > TIMEOUT_TIME) {
      console.log('runner ' + runnerList[runnerIndex].id + " is dead. I am respawning it now.");
      runners.setAlive(runnerList[runnerIndex].id, false);
      spawnRunner(runnerList[runnerIndex].id);
    }
    if (runnerIndex < runnerList.length - 1) {
      runnerIndex = 0;
      runnerIndex++;
    } else {
      runnerIndex = 0;
      runnerList = runners.list();
    }
    setTimeout(function callback() {
      setImmediate(monitorRunners)
    }, 5000);
  } else {
    console.log('There are no available runners now. I am going to spin one up now.');
    spawnRunner();
    setTimeout(function callback() {
      applications.deployApps(applications.list());
      monitorRunners();
    }, 30000);
  }
}


//Given a list of apps to deploy, it will spawn a new runner and deploy



/////////////////////////////////MISC/////////////////////////////

function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
    .toString(16)
    .substring(1);
};