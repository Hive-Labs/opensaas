var httpProxy = require('http-proxy'),
    express = require('express'),
    orchestrator = require('./orchestrator'),
    servConf = require('nconf'),
    winston = require('winston'),
    proxy = new httpProxy.RoutingProxy();

require('js-yaml');

// setup the configs
servConf.defaults(require('./config.yml'))
    .argv()
    .env();
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
logger.cli();

var app = express();
app.use(express.cookieParser());
app.use(express.logger('dev'));
app.use(express.session({
    secret: '1234567890QWERTY'
}));
app.use(express.errorHandler({
    dumpExceptions: true,
    showStack: true
}));

var HAList = [];
var currIndex = 0;

var allowCrossDomain = function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header('Access-Control-Allow-Headers', 'X-Requested-With, Accept, Origin, Referer, User-Agent, Content-Type, Authorization, X-Mindflash-SessionID');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    } else {
        next();
    }
};

app.configure(function() {
    app.use(allowCrossDomain);
});

orchestrator.init(servConf.get().services.orchestrator.host);

app.all('*', function route(req, res) {
    var appName;
    if (servConf.get().server.subdomain_mode) {
        appName = req.headers.host.split('.')[0];
        getNextMachine(appName, req.session.preferredMachine, function(err, machine) {
            if (err) {
                res.statusCode = 404;
                res.end('There are no runners running this app');
            } else {
                req.session.preferredMachine = machine.index;
                res.cookie('hive_preferred_machine', machine.index);
                return proxy.proxyRequest(req, res, machine);
            }
        });
    } else {
        //Split the url into slashes
        var urlArray = req.url.split('/');
        //Get the /app part of the url
        var param2 = urlArray[1];
        if (param2 == 'app') {
            if (urlArray.length == 3 && urlArray[urlArray.length - 1] != '') {
                res.redirect(req.url + '/');
            } else {
                //Get the appName part of the url
                appName = urlArray[2];
                //Preserve the url parameters in case the url contains any
                var urlParams = '';
                if (appName.split('?').length > 0) {
                    urlParams = (appName.split('?')[1]);
                    appName = appName.split('?')[0];
                }

                //Get rid of the /app/:appNam
                urlArray.splice(1, 1);
                urlArray.splice(1, 1);
                //Reconstruct the url without /app/:appName
                if (urlArray.length > 1 && urlParams) {
                    req.url = urlArray.join('/') + "?" + urlParams;
                } else if (urlArray.length > 1) {
                    req.url = urlArray.join('/');
                } else {
                    req.url = '/';
                }
                //Save this to session so we know next time which app you were on
                req.session.appName = appName;
                logger.info("Request with session: " + JSON.stringify(req.session));
                getNextMachine(appName, req.session.preferredMachine, function(err, machine) {
                    if (err) {
                        res.statusCode = 404;
                        res.json(err);
                    } else {
                        req.session.preferredMachine = machine.index;
                        logger.info("1. Setting preferred machine to " + machine.index);
                        res.cookie('hive_preferred_machine', machine.index);
                        logger.info(machine);
                        return proxy.proxyRequest(req, res, machine);
                    }
                });
            }
        } else if (req.session.appName) {
            appName = req.session.appName;
            machineID = req.session.preferredMachine;
            getNextMachine(appName, machineID, function(err, machine) {
                if (err) {
                    res.statusCode = 404;
                    res.json(err);
                } else {
                    req.session.preferredMachine = machine.index;
                    logger.info("2. Setting preferred machine to " + machine.index);
                    res.cookie('hive_preferred_machine', machine.index);
                    logger.info(machine);
                    return proxy.proxyRequest(req, res, machine);
                }
            });
        } else {
            logger.info("Invalid url.");
            res.statusCode = 404;
            res.end('invalid url. Try: /app/:appname');
        }
    }
});

function updateHAList() {
    orchestrator.getHAList(function(err, data) {
        if (!err && data) {
            HAList = JSON.parse(data);
        }
    });
}

function getNextMachine(appName, preferredMachineID, callback) {
    logger.info("Requested machine number " + preferredMachineID);
    if (!HAList || HAList.length === 0) { //There are no runners available
        callback({
            error: "There are no runners available."
        }); //return error
    } else if (preferredMachineID != null && HAList[preferredMachineID] != null && HAList[preferredMachineID].appName.toLowerCase() == appName.toLowerCase()) {
        var preferredMachine = {
            host: HAList[preferredMachineID].host,
            port: (HAList[preferredMachineID].port + 1000),
            index: preferredMachineID
        };
        callback(null, preferredMachine);
    } else if (HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) { //The machine at the current index is what you want
        var oldIndex = currIndex;
        currIndex = (currIndex + 1) % HAList.length;
        var newMachine = {
            host: HAList[oldIndex].host,
            port: (HAList[oldIndex].port + 1000),
            index: oldIndex
        };
        callback(null, newMachine);
    } else { //The machine at the current index is not what you want
        var start = currIndex;
        var newMachine;
        for (var i = 1; i < HAList.length; i++) { //loop through all the machines and check
            currIndex = (i + start) % HAList.length;
            if (HAList && HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) {
                newMachine = {
                    host: HAList[currIndex].host,
                    port: (HAList[currIndex].port + 1000),
                    index: currIndex
                };
                break;
            }
        }
        if (newMachine) {
            currIndex = (currIndex + 1) % HAList.length;
            callback(null, newMachine);
        } else {
            callback({
                error: "There are no machines running app: " + appName
            }); //return error
        }
    }
}

setInterval(updateHAList, servConf.get().server.update_interval);
app.listen(process.env.PORT || servConf.get().server.port);
logger.info('Listening on port ' + (process.env.PORT || servConf.get().server.port));