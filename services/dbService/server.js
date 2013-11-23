#!/usr/bin/env node
/**
 * Module dependencies.
 */
var express = require('express'),
    nconf   = require('nconf'),
    http    = require('http'),
    path    = require('path');

require('js-yaml');

var app = express();

// setup the configs
nconf.defaults(require('./config.yml'))
     .argv()
     .env();


// all environments
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);
app.disable('x-powered-by');


// development only
if('development' == nconf.get('DB_ENV')) {
  console.log('running in development mode');
  console.log('settings: ' + JSON.stringify(nconf.get().adaptor_settings));
  app.use(express.errorHandler());
}

var routes  = require('./routes')(
  {
    persistent: 
      require('./adaptors/' + nconf.get('selected_adaptors:persistent'))(
        nconf.get('adaptor_settings:' + nconf.get('selected_adaptors:persistent') || '')),
    cache: (nconf.get('selected_adaptors:cache') !== undefined) ?  
      require('./adaptors/' + nconf.get('selected_adaptors:cache'))(
        nconf.get('adaptor_settings:' + nconf.get('selected_adaptors:cache') || '')) :
      undefined 
  }
);


// db information routes
app.get('/', routes.db.dbInformation);
app.get('/db', routes.db.dbInformation);
app.get('/db/:application', routes.db.applicationInformation);


// Schema Routes
app.get('/schema/get/:application', routes.schema.get);
app.post('/schema/migrate/:application', routes.schema.migrate);


// Entity action routes
app.get('/entity/:application/:collection/:entity', routes.entity.findAll);
app.get('/entity/:application/:collection/:entity/:id', routes.entity.findById);
app.post('/entity/:application/:collection/:entity', routes.entity.create);
app.post('/entity/:application/:collection/:entity/:id', routes.entity.update);
app.del('/entity/:application/:collection/:entity/:id', routes.entity.del);


http.createServer(app).listen(nconf.get('server:port'), function(){
  console.log('DB Service listening on port: ' + nconf.get('server:port'));
  console.log('Database persistent adaptor Selected: ' + nconf.get('selected_adaptors:persistent'));
  if(nconf.get('selected_adaptors:cache'))
    console.log('Database caching adaptor selected: ' + nconf.get('selected_adaptors:cache')); 
});
