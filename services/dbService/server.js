#!/usr/bin/env node

/**
 * Module dependencies.
 */
var express = require('express'),
    servConf = require('nconf'),
    http = require('http'),
    path = require('path'),
    nconf = require('nconf'),
    bodyParser = require('body-parser'),
    errorHandler = require('errorhandler'),
    busboy = require('connect-busboy'),
    winston = require('winston');

var app = express();

// setup the configs
servConf.file({
    file: './config.yml',
    format: require('nconf-yaml')
});

global.servConf = servConf;

// setup the logger
global.logger = new winston.Logger({
    transports: [
        new(winston.transports.Console)({
            handleExceptions: true
        })
    ],
    exitOnError: false
});

global.exceptions = require('./exceptions');

logger.cli();

// all environments
app.use(bodyParser.json({
    limit: '100mb'
}));
app.use(busboy({
    limits: {
        fileSize: 100 * 1024 * 1024
    }
}));
app.disable('x-powered-by');


// development only
if ('development' == servConf.get('DB_ENV')) {
    logger.info('Running in development mode');
    app.use(errorHandler());
}

var routes = require('./routes')({
    persistent: require('./adaptors/' + servConf.get('selected_adaptors:persistent'))(
        servConf.get('adaptor_settings:' + servConf.get('selected_adaptors:persistent') || '')),
    cache: (servConf.get('selected_adaptors:cache') !== undefined) ?
        require('./adaptors/' + servConf.get('selected_adaptors:cache'))(
            servConf.get('adaptor_settings:' + servConf.get('selected_adaptors:cache') || '')) : undefined
});


// db information routes
app.get('/', routes.db.dbInformation);
app.get('/db', routes.db.dbInformation);
app.get('/db/:application', routes.db.applicationInformation);


// Schema Routes
app.get('/schema/get/:application', routes.schema.get);
app.post('/schema/migrate/:application', routes.schema.migrate);


// Entity action routes
app.get('/entity/:application/:collection/:entity/:id', routes.entity.findById);
app.get('/entity/:application/:collection/:entity', routes.entity.findAll);
app.post('/entity/:application/:collection/:entity', routes.entity.create);
app.post('/entity/:application/:collection/:entity/:id/attachments/:name', routes.entity.attachFile);
app.get('/entity/:application/:collection/:entity/:id/attachments/:name', routes.entity.findAttachment);
app.delete('/entity/:application/:collection/:entity/:id/attachments/:name', routes.entity.removeAttachment);
app.post('/entity/:application/:collection/:entity/:id', routes.entity.update);
app.delete('/entity/:application/:collection/:entity/:id', routes.entity.del);
app.delete('/entity/:application/:collection/:entity', routes.entity.del);


http.createServer(app).listen(servConf.get().server.port, function() {
    logger.info('DB Service listening on port: ' + servConf.get().server.port);
    logger.info('Database persistent adaptor Selected: ' + servConf.get('selected_adaptors:persistent'));
    logger.info('  ', servConf.get('adaptor_settings:' + servConf.get().selected_adaptors.persistent));
    if (servConf.get('selected_adaptors:cache')) {
        logger.info('Database caching adaptor selected: ' + servConf.get('selected_adaptors:cache'));
        logger.info('  ', servConf.get('adaptor_settings:' + servConf.get().selected_adaptors.cache));
    }
});