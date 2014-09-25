var http = require('http'),
    orchestrator = require('./orchestrator'),
    servConf = require('nconf'),
    winston = require('winston'),
    httpProxy = require('.http-proxy'),
    require('js-yaml');

// Load the logger
logger = new winston.Logger({
    transports: [
        new(winston.transports.Console)({
            handleExceptions: true
        })
    ],
    exitOnError: false
});
logger.cli();

// Load the configuration file
servConf.defaults(require('./config.yml')).argv().env();
global.servConf = servConf;

//  Load the loadbalancer that the user chose (eg. roundrobin)
var loadBalancer = require('./' + servConf.get().server.loadbalancer)(servConf);

//  Send the HTTP request to the appropriate loadbalancer
var server = http.createServer(function(req, res) {
    loadBalancer.getNext(req, res).web(req, res);
});


//  Handle the websocket 'Upgrade' event to the appropriate loadbalancer
server.on('upgrade', function(req, socket, head) {
    loadBalancer.getNext(req, res).ws(req, socket, head);
});

//  Every few seconds, check to see if a new machine was added to the list
setInterval(updateHAList, servConf.get().server.update_interval);

//  Start listening on the given port for requests
var port = process.env.PORT || servConf.get().server.port;
server.listen(port);
logger.info("Listening on port " + port);

/*
    Get the most updated list of machines from the orchestrator server.
 */
function updateHAList() {
    orchestrator.getHAList(function(err, data) {
        if (!err && data) {
            loadBalancer.HAList = JSON.parse(data);
        }
    });
}