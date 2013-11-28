module.exports = function(app, runners, applications, logger) {
  app.post('/applications', function(req, res) {
    logger.log('info', 'POST /applications');
    if (!req.body.appName) {
      res.send(400);
      res.end("You need to specify appName.");
    } else {
      res.send(201);
      applications.queue(req.body.appName, function(err, application) {
        res.send(application);
      });
    }
  });

  app.get('/applications', function(req, res) {
    logger.log('info', 'GET /applications');
    if (req.query.only_deployed) {
      applications.listDeployed(function(err, data) {
        res.json(data);
      });
    } else {
      applications.listAvailable(function(err, data) {
        res.json(data);
      });
    }
  });
};