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

try{
  fs.mkdirSync(path.resolve(__dirname, "currentApp/"));
}
catch(e){}

try{
  fs.mkdirSync(path.resolve(__dirname, "logs/"));
}
catch(e){}

var logger = new(winston.Logger)({
  transports: [
  new(winston.transports.Console)({
    handleExceptions: true
  }), new(winston.transports.File)({
    filename: 'logs/runner' + app.get('runnerID') + '.log',
    handleExceptions: true
  })]
});

var application = require('./application')(app, logger);
var runner = require('./runner')(app, application, logger);
require('./routes')(app, runner, application, logger);
runner.updateStatus();



http.createServer(app).listen(app.get('port'), function() {
  winston.log('info', 'RUNNER: Node Runner Service listening on port ' + app.get('port'));
});


var TIMEOUT_TIME = 15 * 1 * 1000; /* ms */
var lastPing = new Date() - TIMEOUT_TIME - 1000;
pingOrchestrator();

function pingOrchestrator() {
  if ((new Date) - lastPing > TIMEOUT_TIME) {
    var newPing = new Date();
    winston.log('info', 'RUNNER: pinging orchestrator at ' + app.get('orchestratorIP'));
    request.put(app.get('orchestratorIP') + "/runners/" + app.get('runnerID'), {
      form: {
        ping: newPing
      }
    }, function(error, response, body){
      if(error){
        logger.log('info', 'Cannot connect to orchestrator at ' + app.get('orchestratorIP'));
      }
      else{
        lastPing = newPing;
      }
    });
    
  }
  setTimeout(function callback() {
    setImmediate(pingOrchestrator)
  }, 5000);
}

