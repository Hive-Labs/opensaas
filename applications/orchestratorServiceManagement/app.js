/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , runners = require('./runners')
  , http = require('http')
  , engine = require('ejs-locals')
  , path = require('path')
  , fs = require('fs');

//Make sure the server configuration file exists
if(!process.env.SERVERIP){
  //throw new Error('Server ip has not been specified in the process.env.SERVERIP');
}

//Setup express
var app = express();
app.set('port', process.env.SUBPORT || 4000);
app.set('orchestratorIP', process.env.ORCHESTRATOR_IP || 'http://localhost:2000');
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname+'/public'));

runners.init(app.get('orchestratorIP'));
// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes.init(runners);
app.get('/', routes.index);


//Start the http server
http.createServer(app).listen(app.get('port'), function(){
  console.log('Orchestrator Service Management listening on port ' + app.get('port'));
});
