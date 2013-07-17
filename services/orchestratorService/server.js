/*
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  dbService = require('dbService'),
  runnersRoute = require('./routes/runnersRoute'),
  runners = require('./runners'),
  http = require('http'),
  path = require('path'),
  fs = require('fs');

var app = express();
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

/* Read the configuration file and register 
the dbServiceModule to use this information */
parseConfigurationFile();

//Setup the routes for accessing runner information
app.get('/', routes.index);
app.get('/runners/list', runnersRoute.list);
app.post('/runners/ping', runnersRoute.ping);
app.post('/runners/add', runnersRoute.add);


//Start listening for route requests
http.createServer(app).listen(app.get('port'), function() {
  console.log('Orchestrator Service listening on port ' + app.get('port'));
});

//Refresh the runner list
var runnerList = runners.list();

//Get the list of apps to deploy
var appList = getAppDeploymentList();

//Deploy all the apps in the list
deployAllApps(appList);

/* Monitor every runner and throw an error if 
runner has been inactive for more than five minutes */
var runnerIndex = 0;
var FIVE_MINUTES = 60 * 5 * 1000; /* ms */
monitorRunner();

/////////////////////////Internal methods////////////////////

function parseConfigurationFile() {
  if (!fs.existsSync("./ServerConfiguration.json")) {
    throw new Error('Server configuration file has not been specified. I am checking process.env.SERVERCONF');
  }
  //Read the file and initialize the dbService
  fs.readFile("./ServerConfiguration.json", 'utf8', function(err, data) {
    if (err) {
      console.log('Error: ' + err);
      return;
    }
    data = JSON.parse(data);
    //Initialize the dbServer module with the ip address and application name
    dbService.init(data.dbService, "OrchestratorService");
  });
}

function spawnRunner(runnerId) {

}

function monitorRunner() {
  console.log((new Date) - runnerList[runnerIndex].ping);
  if ((new Date) - runnerList[runnerIndex].ping > FIVE_MINUTES) {
    console.log('Computer ' + runnerIndex + " is dead. I am respawning it now.");
    spawnRunner(runnerLst[runnerIndex].id);
  }
  if (runnerIndex < runnerList.length - 1) {
    runnerIndex = 0;
    runnerIndex++;
  } else {
    runnerIndex = 0;
    runnerList = runners.list();
  }
  setImmediate(monitorRunner);
}

//This will get the list of apps to be deployed to individual runners
function getAppDeploymentList() {

}

//Given a list of apps to deploy, it will spawn a new runner and deploy
function deployAllApps(appList){

}