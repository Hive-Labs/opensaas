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
  SSHClient = require("NodeSSH"),
  Expect = require('node-expect'),
  winston = require('winston'),
  fs = require('fs');

var app = express();
app.set('port', process.env.PORT || 2000);
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

//Provide applicationRoute.js with access to runners.js and applications.js
applicationsRoute.init(runners, applications);
//Provide runnersRoute.js with access to runners.js and applications.js
runnersRoute.init(runners, applications);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Read ServerConfiguration.json file
parseConfigurationFile();

//Setup the routes for accessing runner information
app.get('/', routes.index);
app.get('/runners/list', runnersRoute.list);
app.get('/runners/log', runnersRoute.log);
app.post('/runners/ping', runnersRoute.ping);
app.post('/runners/add', runnersRoute.add);
app.post('/runners/remove', runnersRoute.removeRunner);
app.post('/applications/deploy', applicationsRoute.deploy);

winston.add(winston.transports.File, {
    filename: 'orchestrator.log',
    handleExceptions: true
  });

//Start listening for clients
http.createServer(app).listen(app.get('port'), function() {
  winston.log('info', 'Orchestrator Service listening on port ' + app.get('port'));
  winston.log('info', 'Winston logging has started.');
});

//Refresh the runner list
var runnerList = runners.list();
//The list of bare metal machines from config file
var bareMetalList;
//Index of the active machine in roundrobin scheme
var currentRoundRobinIndex = 0;

//Monitor the runners frequently to see if any died
var runnerIndex = 0;
var TIMEOUT_TIME = 3 * 60 * 1000; //milliseconds
monitorRunners();

/*
  Summary:      Parse the ServerConfiguration.json file in current directory
                then initialize the application variables with the
                configuration from the file.
 */

function parseConfigurationFile() {
  if (!fs.existsSync("./ServerConfiguration.json")) {
    throw new Error('Server configuration file has not been specified. I am checking process.env.SERVERCONF');
  } else {
    //Store json into a variable
    var data = fs.readFileSync("./ServerConfiguration.json", 'utf8');
    data = JSON.parse(data);
    //Initialize the dbServer module with the ip address and application name
    dbService.init(data.dbService, "OrchestratorService");
    //Provide runners.js with access to dbService variable
    runners.init(data.dbService);
    //Provide applications.js with access to dbService and runners.js
    applications.init(data.dbService, runners);
    //Get the list of bare metal machines from config file and store it
    bareMetalList = data.bareMetalMachines;
  }
}

/*
  Summary:      If a runnerID is specified, it will spawn a new runner
                with that id. Otherwise, it will create a new id and 
                spawn a runner with that.
  Parameters:   runnerID(optional)
 */

function spawnRunner(runnerID) {
  if (runnerID) {
    runners.removeRunner(runnerID);
  } else {
    runnerID = generateID();
  }
  var currMachine = bareMetalList[currentRoundRobinIndex];
  //Connect via SSH to the bare metal machine to run the runner
  var ssh = new SSHClient(currMachine.ip, currMachine.username, currMachine.password);
  //Feed the ip of the orchestrator server, the port to run on, and the id of the runner to the runner
  var sshCommand = "ORCHESTRATOR_IP=http://" + currMachine.ip + ":" + app.get('port') + " RUNNER_ID=" + runnerID + " PORT=" + currMachine.runnerPort + " node " + currMachine.runnerLocation;
  //Execute the ssh command
  ssh.exec(sshCommand);
  //Add this new runner to the existing list of runners
  runners.add(runnerID, "someName", "http://" + currMachine.ip + ":" + currMachine.runnerPort, false);
  //Increment the roundRobin index to the next bare metal machine
  currentRoundRobinIndex++;
  if (currentRoundRobinIndex >= bareMetalList.length) currentRoundRobinIndex = 0;
}

/*
  Summary:      Loop through every runner in the runnerList using
                runnerIndex as counter and make sure that it has
                pinged recently. If it hasn't, assume it is dead,
                mark it as dead, and spin up a new runner with the 
                same name as the old one.
 */

function monitorRunners() {
  //Make sure there is at least 1 runner that is running no apps.
  if (runners.getAvailableRunner()) {
    //Make sure that this runner has pinged the orchestrator TIMEOUT_TIME milliseconds ago
    if (runnerList[runnerIndex] && (new Date) - runnerList[runnerIndex].ping > TIMEOUT_TIME) {
      //If ping time was long ago, complain about it
      winston.log('info', 'runner ' + runnerList[runnerIndex].id + " is dead. I am respawning it now.");
      //Set its status to dead
      runners.setAlive(runnerList[runnerIndex].id, false);
      //Spin up a new runner with the same id as the old one
      spawnRunner(runnerList[runnerIndex].id);
    }
    if (runnerIndex < runnerList.length - 1) {
      //Increment the counter
      runnerIndex++;
    } else {
      runnerIndex = 0;
      runnerList = runners.list();
    }
    //Rerun this function again in 5 seconds
    setTimeout(function callback() {
      setImmediate(monitorRunners)
    }, 5000);
  } else {
    //If there isn't at least 1 runner that is running no apps, complain
    winston.log('info', 'There are no available runners now. I am going to spin one up now.');
    //Then spin up a new runner
    spawnRunner();
    //Wait 30 seconds for this new runner to spin up, then start deploying apps again.
    setTimeout(function callback() {
      applications.deployApps(applications.list());
      monitorRunners();
    }, 30000);
  }
}

/*
  Summary:      Generate a random id of letters and numbers that is
                4 characters long.
  Returns:      A string id of random letters and numbers
 */

function generateID() {
  return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
};