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
app.set('adaptor', process.env.ADAPTOR || 'mongo');
app.use(express.logger('dev'));
app.use(express.bodyParser());
app.use(express.methodOverride());
app.use(app.router);

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

routes.adaptor = require('./adaptors/' + app.get('adaptors'));
routes.adaptor.dbConnect('url', 'username', 'password');



// db information routes
app.get('/', routes.db.dbInformation);
app.get('/db', routes.db.dbInformation);
app.get('/db/:application', routes.db.applicationInformation);


// Schema Routes
app.get('/schema/get/:application', routes.schema.get);
app.post('/schema/migrate/:application', routes.schema.migrate);


// Entity action routes
app.get('/entity/:application/:collection/:entity', routes.entity.findAll);
app.get('/entity/:application/:collection/:entity/:id', routes.entity.findOne);
app.post('/entity/:application/:collection/:entity', routes.entity.create);
app.post('/entity/:application/:collection/:entity/:id', routes.entity.update);
app.del('/entity/:application/:collection/:entity/:id', routes.entity.del);


http.createServer(app).listen(app.get('port'), function(){
  console.log('DB Service listening on port ' + app.get('port'));
});
