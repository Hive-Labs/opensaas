/*
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  applicationRoute = require('./routes/applicationRoute'),
  dbService = require('dbService'),
  application = require('./application'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'),
  winston = require('winston'),
  request = require('request'),
  runner = require('./runner');

var app = express();
app.set('port', process.env.PORT || 3001);
app.set('orchestratorIP', process.env.ORCHESTRATOR_IP || 'http://localhost:2000');
app.set('runnerID', process.env.RUNNER_ID || 'ID');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);



//Provide application.js with orchestratorIP and runnerID
application.init(app.get('orchestratorIP'), app.get('runnerID'), winston);
//Provide applicationRoute.js with application.js
applicationRoute.init(application);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.post('/application/start', applicationRoute.start);
app.get('/runner/log', routes.log);
app.post('/runner/kill', routes.kill);

runner.init(app.get('runnerID'));
routes.init(runner);

http.createServer(app).listen(app.get('port'), function() {
  winston.log('info', 'RUNNER: Node Runner Service listening on port ' + app.get('port'));
});

winston.add(winston.transports.File, { filename: 'runner' + app.get('runnerID') + '.log', handleExceptions: true});


var TIMEOUT_TIME = 1 * 60 * 1000; /* ms */
var lastPing = new Date() - TIMEOUT_TIME - 1000;
pingOrchestrator();

function pingOrchestrator() {
  if ((new Date) - lastPing > TIMEOUT_TIME) {
    winston.log('info', 'RUNNER: pinging orchestrator at ' + app.get('orchestratorIP'));
    request.post(app.get('orchestratorIP') + "/runners/ping", {
      form: {
        runnerID: app.get('runnerID')
      }
    })
    lastPing = new Date();
  }
  setTimeout(function callback() {
    setImmediate(pingOrchestrator)
  }, 5000);
}

