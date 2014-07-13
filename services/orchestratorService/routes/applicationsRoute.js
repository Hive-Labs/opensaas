module.exports = function(app, runners, applications, logger) {
    app.post('/', function(req, res) {
        logger.log('info', 'POST /applications');
        if (!req.body.appName) {
            res.end("You need to specify appName.");
        } else {
            applications.queue(req.body.appName, function(err, application) {
                res.json(application);
            });
        }
    });

    app.get('/', function(req, res) {
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