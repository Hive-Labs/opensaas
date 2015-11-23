module.exports = function(app, runners, applications, logger) {
    app.get('/', function(req, res) {
        logger.info('GET /runners');
        if (!req.query.only_proxy) {
            runners.list(false, function(err, runnerList) {
                if (!err) {
                    res.json(runnerList);
                } else {
                    res.send(500);
                }
            });
        } else {
            runners.list(true, function(err, runnerList) {
                res.json(runnerList);
            });
        }
    });

    app.post('/', function(req, res) {
        logger.info('POST /runners');
        if (!req.body._expand) {
            runners.spawnRunner(function(err, runner) {
                if (!err)
                    res.send(runner);
            });
        }
    });

    app.get('/:id', function(req, res) {
        logger.info('GET /runners/' + req.params.id);
        runners.getRunnerByID(req.params.id, function(err, runner) {
            if (runner && !err) {
                res.end((runner));
            } else {
                res.end('An error Occured');
            }
        });
    });

    app.get('/:id/log', function(req, res) {
        logger.info('GET /runners/' + req.params.id + "/log");
        var log = runners.log(req.params.id, function(err, log) {
            if (log && !err) {
                res.json(log);
            } else {
                res.end('An error Occured');
            }
        });
    });

    app.get('/:id/health', function(req, res) {
        logger.info('GET /runners/' + req.params.id + "/health");
        var health = runners.getHealth(req.params.id, function(err, health) {
            if (err) {
                res.json({
                    cpu: 0,
                    memory: 0
                });
            } else {
                res.send(health);
            }
        });
    });

    app.put('/:id', function(req, res) {
        logger.info('PUT /runners/' + req.params.id);
        runners.ping(req.params.id, req.body.log, req.body.health, function(err) {
            runners.getRunnerByID(req.params.id, function(err, runner) {
                if (runner && !err) {
                    res.json(runner);
                } else {
                    res.json([]);
                }
            });
        });
    });

    app.delete('/:id', function(req, res) {
        logger.info('DELETE /runners/' + req.params.id);
        var runner = runners.removeRunner(req.params.id, function(err) {
            if (!err)
                res.end('The runner was removed successfully.');
        });
    });
};