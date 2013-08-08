// node.js proxy server example for adding CORS headers to any existing http services.
// yes, i know this is super basic, that's why it's here. use this to help understand how http-proxy works with express if you need future routing capabilities
var httpProxy = require('http-proxy'),
	express = require('express'),
	orchestrator = require('./orchestrator');
var proxy = new httpProxy.RoutingProxy();

var HAList = [];

var app = express();

app.use(express.errorHandler({
	dumpExceptions: true,
	showStack: true
}));


var currIndex = 0;
var allowCrossDomain = function(req, res, next) {
		console.log('allowingCrossDomain');
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

orchestrator.init('http://localhost:2000');

app.all('*', function route(req, res) {
	var appName = req.headers.host.split('.')[0];
	if (!HAList || HAList.length == 0) {
		res.end('There are no runners in the HA List.');
	} else if (HAList && HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName)
	{
		return proxy.proxyRequest(req, res, {
					host: HAList[currIndex].host,
					port: (HAList[currIndex].port + 1000)
				});
		currIndex  = (currIndex + 1) % HAList.length;
	}
	else{
		var i = (currIndex + 1) % HAList.length;
		while (i != currIndex) {
			console.log(HAList[i]);
			if (HAList && HAList[i] && HAList[i].appName && HAList[i].appName.toLowerCase() == appName) {
				return proxy.proxyRequest(req, res, {
					host: HAList[currIndex].host,
					port: (HAList[currIndex].port + 1000)
				});
				break;
			}
			i = (i + 1) % HAList.length;
		}
		res.end('There are no runners running this app');
	}
});

function updateHAList() {
	orchestrator.getHAList(function(data) {
		HAList = JSON.parse(data);
	});
	setTimeout(updateHAList, 3000);
};

updateHAList();


app.listen(7000);
console.log('#########\nListening on 7000\n##########');


//
// Addresses to use in the round robin proxy
//