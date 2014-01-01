/**
 * Module dependencies.
 */

var express = require('express'),
  routes = require('./routes'),
  apiRoute = require('./routes/apiRoute.js'),
  http = require('http'),
  path = require('path'),
  dbService = require('dbService');

var app = express();

app.configure(function() {
  app.set('port', process.env.SUBPORT || 3000);
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(express.cookieParser());
  app.use(app.router);
  app.use(express.static(path.join(__dirname, 'public')));
  app.use(express.static(path.join(__dirname, 'views')));
});

app.configure('development', function() {
  app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/api/logout', apiRoute.logout);
app.get('/api/user', apiRoute.userInfo);

dbService.init("localhost", "orchestratorServiceManagement");



http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});