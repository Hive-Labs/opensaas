/**
 * Module dependencies.
 */

var express = require('express'),
    nconf   = require('nconf'),
    routes  = require('./routes'),
    http    = require('http'),
    path    = require('path');

var app = express();

// setup the configs
nconf.argv()
     .env()
     .file({ file: './package.json' });

/*
 * DB_ENV controls the verbosity of the logger
 * server controls all server settings
 * 
 * @param server:port               the port the db service will listen on
 * @param server:adaptor:cache      which adaptor to use as a cache
 * @param server:adaptor:persistent which adaptor to use as persistent storage
 * @param available_adaptors        hash of all configured adaptor settings
 */
nconf.defaults({
  'DB_ENV': 'development',
  'server': {
    'port': 3000,
    'adaptor': {
      'cache':'redis',
      'persistent': 'redis'
    }
  },
  'adaptor_settings': {
    'redis': {

    }
  }
});

// all environments
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == nconf.get('server:environment')) {
  app.use(express.errorHandler());
}

routes.adaptor = require('./adaptors/' + nconf.get('server:adaptor:persistent'))(nconf.get('server:'));



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
  console.log('Database Adaptor Selected: ' + app.get('adaptor'));
});
