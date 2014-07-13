var express = require('express'),
    dbService = require('dbService'),
    http = require('http'),
    path = require('path'),
    fs = require('fs'),
    winston = require('winston'),
    request = require('request');

var app = express();

app.configure(function() {
    app.set('port', process.env.PORT || 3001);
    app.set('orchestratorIP', process.env.ORCHESTRATOR_IP || 'http://localhost:2000');
    app.set('runnerID', process.env.RUNNER_ID || 'ID');
    app.set('views', __dirname + '/views');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
});

if ('development' == app.get('env')) {
    app.use(express.errorHandler());
}

try {
    fs.mkdirSync(path.resolve(__dirname, "currentApp"));
} catch (e) {}

try {
    fs.mkdirSync(path.resolve(__dirname, "currentApp/" + app.get('runnerID')));
} catch (e) {}

try {
    fs.mkdirSync(path.resolve(__dirname, "logs/"));
} catch (e) {}

var logger = new(winston.Logger)({
    transports: [
        new(winston.transports.Console)({
            handleExceptions: true
        }), new(winston.transports.File)({
            filename: 'logs/runner' + app.get('runnerID') + '.log',
            handleExceptions: true,
            json: true
        })
    ]
});

logger.cli();

var application = require('./application')(app, logger);
var runner = require('./runner')(app, application, logger);
require('./routes')(app, runner, application, logger);
runner.updateStatus();


try {
    http.createServer(app).listen(app.get('port'), function() {
        logger.log('info', 'RUNNER: Node Runner Service listening on port ' + app.get('port'));
        pingOrchestrator();
    });
} catch (e) {
    logger.warn(e);
}


var TIMEOUT_TIME = 15 * 1 * 1000; /* ms */
var lastPing = new Date() - TIMEOUT_TIME - 1;

function pingOrchestrator() {
    if ((new Date) - lastPing > TIMEOUT_TIME) {
        var newPing = new Date();
        logger.log('info', 'RUNNER: pinging orchestrator at ' + app.get('orchestratorIP'));
        runner.health(function(err1, health) {
            logger.info("health=" + JSON.stringify(health));
            runner.log(function(err2, log) {
                logger.info("health=" + JSON.stringify(log));
                logger.info("Putting to:" + app.get('orchestratorIP') + "/runners/" + app.get('runnerID'));
                request.put(app.get('orchestratorIP') + "/runners/" + app.get('runnerID'), {
                    form: {
                        ping: newPing,
                        health: health,
                        log: log
                    }
                }, function(error, response, body) {
                    if (error) {
                        logger.log('info', 'Cannot connect to orchestrator at ' + app.get('orchestratorIP'));
                    } else {
                        lastPing = newPing;
                    }
                });
            });
        });
    }
    setTimeout(function callback() {
        setImmediate(pingOrchestrator)
    }, 5000);
}