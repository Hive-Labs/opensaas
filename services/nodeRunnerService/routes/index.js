module.exports = function(app, runner, application, logger) {

  app.get('/', function(req, res) {
    logger.log('info', 'GET /');
    res.end('Node Runner Service: ' + app.get('runnerID'));
  });

  app.put('/application', function(req, res) {
    logger.log('info', 'PUT /application');
    if (!req.files.applicationTar || !req.body.applicationName) {
      res.send(400);
      res.end('You need to set parameters "applicationTar" and "applicationName"');
    } else {
      application.start(req.files.applicationTar, req.body.applicationName, function(err, appJSON) {
        res.send(200);
        res.end(appJSON);
      });
    }
  });

  app.delete('/', function(req, res) {
    logger.log('info', 'DELETE /');
    res.send(204);
    logger.log('info', 'Killing app.');
    application.kill(function(err) {
      logger.log('info', 'Killing runner.');
      runner.kill();
    });
  });

  app.get('/log', function(req, res) {
    logger.log('info', 'GET /log');
    runner.log(function callback(err, log) {
      res.JSON(log);
    });
  });

  app.get('/health', function(req, res) {
    logger.log('info', 'GET /health');
    runner.health(function callback(err, health) {
      res.end(health);
    });
  });
}