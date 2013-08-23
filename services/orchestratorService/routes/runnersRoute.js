module.exports = function(app, runners, applications, logger) {
  app.get('/runners', function(req, res) {
    logger.log('info', 'GET /runners');
    res.header("Access-Control-Allow-Origin", "*");
    if (!req.query.only_proxy) {
      runners.list(false, function(err, runnerList) {
        res.end(JSON.stringify(runnerList));
      });
    } else {
      runners.list(true, function(err, runnerList) {
        res.end(JSON.stringify(runnerList));
      });
    }
  });

  app.post('/runners', function(req, res) {
    logger.log('info', 'POST /runners');
    res.header("Access-Control-Allow-Origin", "*");
    if (!req.body._expand) {
      runners.spawnRunner(function(err, runner) {
        res.send(201);
        res.send(runner);
      });
    }
  });

  app.get('/runners/:id', function(req, res) {
    logger.log('info', 'GET /runners/' + req.params.id);
    res.header("Access-Control-Allow-Origin", "*");
    runners.getRunnerByID(req.params.id, function(err, runner) {
      res.end(runner);
    });
  });

  app.get('/runners/:id/log', function(req, res) {
    logger.log('info', 'GET /runners/' + req.params.id + "/log");
    res.header("Access-Control-Allow-Origin", "*");
    var log = runners.log(req.params.id, function(err, log) {
      res.end(log);
    });
  });

  app.get('/runners/:id/health', function(req, res) {
    logger.log('info', 'GET /runners/' + req.params.id + "/health");
    res.header("Access-Control-Allow-Origin", "*");
    var health = runners.getHealth(req.params.id, function(err, health) {
      if (err) {
        res.send(JSON.stringify({
          cpu: 0,
          memory: 0
        }));
      } else {
        res.send(health);
      }
    });
  });

  app.put('/runners/:id', function(req, res) {
    logger.log('info', 'PUT /runners/' + req.params.id);
    runners.ping(req.params.id, function(err) {
      runners.getRunnerByID(req.params.id, function(err, runner) {
        if (runner) {
          res.send(200);
          res.end(JSON.stringify(runner));
        } else {
          res.send(400);
          res.end([]);
        }
      });
    });
  });

  app.delete('/runners/:id', function(req, res) {
    logger.log('info', 'DELETE /runners/' + req.params.id);
    var runner = runners.removeRunner(req.params.id, function(err) {
      res.send(204);
      res.end('The runner was removed successfully.');
    });
  });
};