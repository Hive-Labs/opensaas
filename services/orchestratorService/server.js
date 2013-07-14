/**
 * Module dependencies.
 */
var express = require('express')
  , routes = require('./routes')
  , dbService = require('dbService')
  , runnersRoute = require('./routes/runnersRoute')
  , http = require('http')
  , engine = require('ejs-locals')
  , path = require('path')
  , fs = require('fs');

  

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');
app.engine('ejs', engine);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.use(express.static(__dirname+'/public'));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/runners/list', runnersRoute.list);
app.post('/runners/ping', runnersRoute.ping);
app.post('/runners/add', runnersRoute.add);


http.createServer(app).listen(app.get('port'), function(){
  console.log('Orchestrator Service listening on port ' + app.get('port'));
});

console.log(process.env.SERVERCONF);
if(!process.env.SERVERCONF || !fs.existsSync(process.env.SERVERCONF)){
  throw new Error('Server configuration file has not been specified. I am checking process.env.SERVERCONF');
}