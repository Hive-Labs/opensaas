var express = require('express'),
    http = require('http'),
    winston = require('winston'),
    asciimo = require('asciimo').Figlet,
    pjson = require('./package.json'),
    morgan = require("morgan"),
    bodyParser = require("body-parser"),
    methodOverride = require("method-override"),
    fs = require('fs');

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            handleExceptions: true
        }), new(winston.transports.File)({
            filename: 'orchestrator.log',
            handleExceptions: true
        })
    ]
});

logger.cli();

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

if (process.env.NODE_ENV !== 'production') {
    require('longjohn');
}


var app = express();
app.use(allowCrossDomain);
app.set('port', process.env.PORT || 2000);
app.use(morgan('dev'));
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(function(err, req, res, next) {
    logger.error(err.stack);
    res.send(500, 'Something broke!');
});

var settings = parseConfigurationFile();
settings.orchestratorPort = app.get('port');

var loadBalancer = require('./loadbalancers/nodeRunners-roundrobin.js')(settings.bareMetalMachines);
var runners = require('./runners')(loadBalancer, settings, logger);
var applications = require('./applications')(runners, settings, logger);

var runnersRoute = express.Router();
var applicationsRoute = express.Router();

require('./routes/applicationsRoute')(applicationsRoute, runners, applications, logger);
require('./routes/runnersRoute')(runnersRoute, runners, applications, logger);

app.use('/runners', runnersRoute);
app.use('/applications', applicationsRoute);

asciimo.write('Open SAAS', 'Banner', function(result, font) {
    logger.info("\n" + result);
    logger.info('Version: ' + pjson.version);
    logger.info("\n\n\n\n");
    http.createServer(function(req, res) {
        // Pass the request to express
        req.on('error', function(e) {
            logger.warn('problem with request: ' + e.message);
        });
        res.on('error', function(e) {
            logger.warn('problem with response: ' + e.message);
        });
        app(req, res);
    }).on("clientError", function(exception, socket) {
        logger.warn("Client error: " + exception);
    }).listen(app.get('port'), function() {
        logger.log('info', 'Orchestrator Service listening on port ' + app.get('port'));
        logger.log('info', 'Winston logging has started.');
    });
});

applications.queue("orchestratorServiceManagement", function(err, application) {});

monitorRunners();

function parseConfigurationFile() {
    if (!fs.existsSync("./ServerConfiguration.json")) {
        var finalFile = {};
        finalFile.bareMetalMachines = [];
        console.log("Welcome! This seems to be your first time because you have not yet setup your server configuration file. I will ask you a series of questions and automatically create this for you (how nice of me).");
        ask("1) What should be the timeout time for each runner in milliseconds?", '.', function(timeout_time) {
            ask("2) How many machines would you like to register?", '.', function(numberOfRunners) {
                ask("3) OK. What is the location of the dbService (eg. localhost:2001)", '.', function(dbService) {
                    finalFile.dbService = dbService;
                    finalFile.TIMEOUT_TIME = timeout_time;

                    function incrementQuestion(i) {
                        if (i > numberOfRunners) {
                            var outputFilename = 'ServerConfiguration.json';
                            fs.writeFile(outputFilename, JSON.stringify(finalFile, null, 4), function(err) {
                                if (err) {
                                    console.log(err);
                                } else {
                                    console.log('THANKS! I have made a file called ServerConfiguration.json and I will remember this next time.');
                                    return parseConfigurationFile();
                                }
                            });
                        } else {
                            ask((i + 4) + "a) What is the IP of machine " + i + "? (eg. localhost)", '.', function(runnerIP) {
                                ask((i + 4) + "b) What is the SSH username of machine " + i + "? (eg. steve)", '.', function(runnerUsername) {
                                    ask((i + 4) + "c) What is the SSH password of machine " + i + "? (eg. fluffybunnies)", '.', function(runnerPassword) {
                                        ask((i + 4) + "d) Where is the nodeRunnerService located in machine " + i + "? (eg. ~/notoja/notoja-saas/services/nodeRunnerService/)", '.', function(runnerLocation) {
                                            ask((i + 4) + "e) Where is the start port for machine " + i + "? (eg. 3000)", '.', function(portStart) {
                                                ask((i + 4) + "f) Where is the finish port for machine " + i + "? (eg. 3400)", '.', function(portFinish) {
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
        });
    } else {
        //Store json into a variable
        var data = fs.readFileSync("./ServerConfiguration.json", 'utf8');
        data = JSON.parse(data);
        return data;
    }
}


/*
  Summary:      Loop through every runner in the runnerList using
                runnerIndex as counter and make sure that it has
                pinged recently. If it hasn't, assume it is dead,
                mark it as dead, and spin up a new runner.
 */

function monitorRunners() {
    runners.list(false, function(err, currentList) {
        runners.getAvailableRunner(function(err2, runnerID) {
            //If there isn't at least 1 runner that is running no apps, complain
            if (!runnerID) {
                logger.log('info', 'There are no available runners now. I am going to spin one up now.');
                runners.spawnRunner();
                //Wait 3 seconds for this new runner to spin up, then start deploying apps again.
                setTimeout(function() {
                    applications.listDeployed(function(err, appList) {
                        applications.deployApps(appList);
                    });
                    monitorRunners();
                }, 3000);
            } else {
                for (var i = 0; i < currentList.length; i++) {
                    checkRunner(currentList[i].id);
                }
                setTimeout(function() {
                    monitorRunners();
                }, 1000);
            }
        });
    });
}

function checkRunner(runnerID, callback) {
    runners.getRunnerByID(function(err, runner) {
        if (runner.alive && (new Date()) - runner.ping > settings.TIMEOUT_TIME) {
            logger.log('info', 'runner ' + runner.id + " is dead. Let me spin up another runner now.");
            runners.setAlive(runner.id, false, function(err2) {
                runners.spawnRunner(function() {
                    if (callback)
                        callback();
                    setTimeout(function callback(err3) {
                        applications.deployApps(applications.list());
                    }, 3000);
                });
            });
        }
    });
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