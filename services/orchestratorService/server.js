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
  nodeRunnerBalancer = require('./loadbalancers/nodeRunners-roundrobin.js')
  asciimo = require('asciimo').Figlet,
  fs = require('fs')

  var app = express();

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
  };


app.configure(function() {
  app.use(allowCrossDomain);
  app.set('port', process.env.PORT || 2000);
  app.set('views', __dirname + '/views');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
});


//Provide applicationRoute.js with access to runners.js and applications.js
applicationsRoute.init(runners, applications);
//Provide runnersRoute.js with access to runners.js and applications.js
runnersRoute.init(runners, applications);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}


//Setup the routes for accessing runner information
app.get('/', routes.index);
app.get('/runner/list', runnersRoute.list);
app.get('/runner/HAList', runnersRoute.HAlist);
app.post('/runner/spawn', runnersRoute.spawn);
app.get('/runner/:id/log', runnersRoute.log);
app.get('/runner/:id/status', runnersRoute.status);
app.post('/runners/ping', runnersRoute.ping);
app.post('/runners/add', runnersRoute.add);
app.del('/runner/:id', runnersRoute.removeRunner);
app.post('/applications/deploy', applicationsRoute.deploy);
app.get('/applications/list', applicationsRoute.list);

//Refresh the runner list
var runnerList;

//Monitor the runners frequently to see if any died
var runnerIndex = 0;
var TIMEOUT_TIME = 25 * 1 * 1000; //milliseconds
//Read ServerConfiguration.json file
parseConfigurationFile(function callback() {
  asciimo.write('Open SAAS', 'Banner', function(result, font) {
    console.log(result);
    console.log("\n\n\n\n");
  });

/*winston.add(winston.transports.File, {
    filename: 'orchestrator.log',
    handleExceptions: true
  });*/

  //Start listening for clients
  http.createServer(app).listen(app.get('port'), function() {
    winston.log('info', 'Orchestrator Service listening on port ' + app.get('port'));
    winston.log('info', 'Winston logging has started.');
  });

  runnerList = runners.list();

  monitorRunners();
  applications.add("orchestratorServiceManagement");
});


/*
  Summary:      Parse the ServerConfiguration.json file in current directory
                then initialize the application variables with the
                configuration from the file.
 */

function parseConfigurationFile(callback) {


  if (!fs.existsSync("./ServerConfiguration.json")) {
    var finalFile = {};
    finalFile.bareMetalMachines = [];
    console.log("Welcome! This seems to be your first time because you have not yet setup your server configuration file. I will ask you a series of questions and automatically create this for you (how nice of me).");
    ask("1) How many machines would you like to register?", '.', function(numberOfRunners) {
      ask("2) OK. What is the location of the dbService (eg. localhost:2001)", '.', function(dbService) {
        finalFile.dbService = dbService;

        function incrementQuestion(i) {
          if (i > numberOfRunners) {
            var outputFilename = 'ServerConfiguration.json';
            fs.writeFile(outputFilename, JSON.stringify(finalFile, null, 4), function(err) {
              if (err) {
                console.log(err);
              } else {
                console.log('THANKS! I have made a file called ServerConfiguration.json and I will remember this next time.');
                parseConfigurationFile(callback);
              }
            });
          } else {
            ask((i + 3) + "a) What is the IP of machine " + i + "? (eg. localhost)", '.', function(runnerIP) {
              ask((i + 3) + "b) What is the SSH username of machine " + i + "? (eg. steve)", '.', function(runnerUsername) {
                ask((i + 3) + "c) What is the SSH password of machine " + i + "? (eg. fluffybunnies)", '.', function(runnerPassword) {
                  ask((i + 3) + "d) Where is the nodeRunnerService located in machine " + i + "? (eg. ~/notoja/notoja-saas/services/nodeRunnerService/)", '.', function(runnerLocation) {
                    ask((i + 3) + "e) Where is the start port for machine " + i + "? (eg. 3000)", '.', function(portStart) {
                      ask((i + 3) + "f) Where is the finish port for machine " + i + "? (eg. 3400)", '.', function(portFinish) {
                        if (runnerLocation.indexOf('/', runnerLocation.length - 1) == -1) {
                          runnerLocation = runnerLocation + "/";
                        }
                        finalFile.bareMetalMachines.push({
                          "ip": runnerIP,
                          "username": runnerUsername,
                          "password": runnerPassword,
                          "runnerLocation": runnerLocation,
                          "portStart": portStart,
                          "portFinish": portFinish
                        });
                        incrementQuestion(i + 1);
                      });
                    });
                  });
                });
              });
            });
          }

        }
        incrementQuestion(1);
      });
    });


  } else {
    //Store json into a variable
    var data = fs.readFileSync("./ServerConfiguration.json", 'utf8');
    data = JSON.parse(data);
    //Initialize the dbServer module with the ip address and application name
    dbService.init(data.dbService, "OrchestratorService");
    //Provide runners.js with access to dbService variable
    runners.init(data.dbService, nodeRunnerBalancer, app.get('port'), winston);
    //Provide applications.js with access to dbService and runners.js
    applications.init(data.dbService, runners);
    //Get the list of bare metal machines from config file and store it
    nodeRunnerBalancer.init(data.bareMetalMachines);

    callback();
  }
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
    if (runnerList[runnerIndex].alive && runnerList[runnerIndex] && (new Date) - runnerList[runnerIndex].ping > TIMEOUT_TIME) {
      //If ping time was long ago, complain about it
      winston.log('info', 'runner ' + runnerList[runnerIndex].id + " is dead. Let me spin up another runner now.");
      //Set its status to dead
      runners.setAlive(runnerList[runnerIndex].id, false);
      //Spin up a new runner with the same id as the old one
      runners.spawnRunner();
      setTimeout(function callback() {
        applications.deployApps(applications.list());
      }, 15000);
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
    }, 15000);
  } else {
    //If there isn't at least 1 runner that is running no apps, complain
    winston.log('info', 'There are no available runners now. I am going to spin one up now.');
    //Then spin up a new runner
    runners.spawnRunner();
    //Wait 30 seconds for this new runner to spin up, then start deploying apps again.
    setTimeout(function callback() {
      applications.deployApps(applications.list());
      monitorRunners();
    }, 30000);
  }
}


function ask(question, format, callback) {
  var stdin = process.stdin,
    stdout = process.stdout;

  stdin.resume();
  stdout.write(question + ": ");

  stdin.once('data', function(data) {
    data = data.toString().trim();
    var regex = new RegExp(format);
    if (regex.test(data)) {
      callback(data);
    } else {
      stdout.write("It should match: " + regex + "\n");
      ask(question, format, callback);
    }
  });
}

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
      res.send(200);
    } else {
      next();
    }
  };