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
app.set('port', process.env.PORT || 3000);
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
app.post('/applications/deploy', applicationsRoute.deploy);

//Start listening for route requests
http.createServer(app).listen(app.get('port'), function() {
  console.log('Orchestrator Service listening on port ' + app.get('port'));
});

//Refresh the runner list
var runnerList = runners.list();

//Get the list of apps to deploy
var appList = getAppDeploymentList();

//The list of bare metal machines you have access to
var bareMetalList;
var currentRoundRobinIndex = 0;

//Deploy all the apps in the list
deployAllApps(appList);

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
  if (runnerId) {
    runners.removeRunner(runnerId);
  }
  else{
    runnerId = s4();
  }
  var currMachine = bareMetalList[currentRoundRobinIndex];
  var ssh = new SSHClient(currMachine.ip, currMachine.username, currMachine.password);
  ssh.exec("node " + currMachine.runnerLocation + " > \"runner" + runnerId + ".log\"");
  console.log("runing command: " + "node " + currMachine.runnerLocation + " > \"runner" + runnerId + ".log\"");

  runners.add(runnerId, "someName", "http://" + currMachine.ip + ":" + currMachine.runnerPort);
  currentRoundRobinIndex++;
  if (currentRoundRobinIndex >= bareMetalList.length) currentRoundRobinIndex = 0;
  console.log('done!');
}

function monitorRunners() {
  if (runnerList && runnerList.length > 0) {
    if ((new Date) - runnerList[runnerIndex].ping > TIMEOUT_TIME) {
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
  } else {
    spawnRunner();
  }
  setTimeout(function callback(){setImmediate(monitorRunners)}, 5000);
}

//This will get the list of apps to be deployed to individual runners

function getAppDeploymentList() {

}

//Given a list of apps to deploy, it will spawn a new runner and deploy

function deployAllApps(appList) {

}

/////////////////////////////////MISC/////////////////////////////
function s4() {
  return Math.floor((1 + Math.random()) * 0x10000)
             .toString(16)
             .substring(1);
};