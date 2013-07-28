/*
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  applicationRoute = require('./routes/applicationRoute'),
  dbService = require('dbService'),
  http = require('http'),
  path = require('path'),
  fs = require('fs'),
  request = require('request');

var app = express();
app.set('port', process.env.PORT || 3002);
app.set('orchestratorIP', process.env.ORCHESTRATOR_IP || 'http://localhost:3000');
app.set('runnerID', process.env.RUNNER_ID || 'ID');
app.set('views', __dirname + '/views');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

//Application information route
app.get('/', routes.index);
app.post('/application/start', applicationRoute.start);

//Start listening for requests
http.createServer(app).listen(app.get('port'), function() {
  console.log('Node Runner Service listening on port ' + app.get('port'));
});

var TIMEOUT_TIME = 1 * 60 * 1000; /* ms */
pingOrchestrator();
var lastPing = new Date() - 1000;
function pingOrchestrator() {
    if ((new Date) - lastPing > TIMEOUT_TIME) {
    	console.log('pinging orchestrator at ' + app.get('orchestratorIP'));
		request.post(app.get('orchestratorIP') + "/runners/ping", {form:{runnerID: app.get('runnerID')}})      	
		lastPing = new Date();
    }
  setImmediate(pingOrchestrator);
} 