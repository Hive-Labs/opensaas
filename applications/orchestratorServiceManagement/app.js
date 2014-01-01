/**
 * Module dependencies.
 */

var express = require('express'),
  http = require('http'),
  engine = require('ejs-locals'),
  servConf   = require('nconf'),
  path = require('path'),
  dbService = require('dbService'),
  winston = require('winston'),
  jsYaml = require('js-yaml');

// setup the configs
servConf.defaults(require('./config.yml'))
     .argv()
     .env();

global.servConf = servConf;

// setup the logger
global.logger = new winston.Logger({
  transports: [
    new (winston.transports.Console)({
      handleExceptions: true
    })
  ],
  exitOnError: false
});
logger.cli();

logger.info(servConf.get());
var apiRoute = require('./routes/apiRoute.js')(servConf, dbService);
var routes = require('./routes')(servConf, dbService);

var app = express();

app.configure(function() {
  app.set('port', process.env.SUBPORT || servConf.get().server.port);
  app.set('view engine', 'ejs');
  app.use(express.favicon());
  app.engine('ejs', engine);
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

dbService.init("127.0.0.1", 3000, "orchestratorServiceManagement");



http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});