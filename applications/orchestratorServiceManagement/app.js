/**
 * Module dependencies.
 */
var express = require('express'),
	http = require('http'),
	engine = require('ejs-locals'),
	path = require('path'),
	fs = require('fs');

//Setup express
var app = express();
app.set('port', process.env.SUBPORT || 4000);
app.set('orchestratorIP', process.env.ORCHESTRATOR_IP || 'http://localhost:2000');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname + '/dist'));

// development only
if ('development' == app.get('env')) {
	app.use(express.errorHandler());
}


//Start the http server
http.createServer(app).listen(app.get('port'), function() {
	console.log('Orchestrator Service Management listening on port ' + app.get('port'));
});