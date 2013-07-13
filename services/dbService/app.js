/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http'),
    path = require('path');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('selectedAdaptor', process.env.ADAPTOR || mongo);
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

app.get('/', routes.index);
app.get('/:application', routes.applicationInformation);

app.get('/:application/:collection/:entity', routes.findAll); 
app.get('/:application/:collection/:entity/:id', routes.findOne);
app.post('/:application/:collection/:entity', routes.create);
app.post('/:application/:collection/:entity/:id', routes.update);
app.delete('/:application/:collection/:entity/:id', routes.delete);

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
