var httpProxy = require('http-proxy'),
	express = require('express'),
	orchestrator = require('./orchestrator'),
	proxy = new httpProxy.RoutingProxy();

var HAList = [];
var currIndex = 0;

var app = express();

app.use(express.errorHandler({
	dumpExceptions: true,
	showStack: true
}));

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

orchestrator.init('http://localhost:2000');

app.all('*', function route(req, res) {
	var appName = req.headers.host.split('.')[0];
	console.log('Searching for ' + appName);
	getNextMachine(appName, function(err, machine){
		if(err)
		{
			res.end('There are no runners running this app');	
		}
		else{
			return proxy.proxyRequest(req, res, machine);
		}
	});
});

function updateHAList(){
	orchestrator.getHAList(function(err, data) {
		if (!err && data) {
			HAList = JSON.parse(data);
		}
	});	
}

function getNextMachine(appName, callback) {
	if (!HAList || HAList.length === 0) { //There are no runners available
		callback(-1); //return error
	} else if (HAList && HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) { //The machine at the current index is what you want
		var oldIndex = currIndex;
		currIndex = (currIndex + 1) % HAList.length;
		var newMachine = {
			host: HAList[oldIndex].host,
			port: (HAList[oldIndex].port + 1000)
		};
		callback(null, newMachine);
	} else { //The machine at the current index is not what you want
		var start = currIndex;
		var newMachine;
		for (var i = 0; i < HAList.length; i++) { //loop through all the machines and check
			currIndex = (i + start) % HAList.length;
			if (HAList && HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) {
				newMachine = {
					host: HAList[currIndex].host,
					port: (HAList[currIndex].port + 1000)
				};
				break;
			}
		}
		if(newMachine){
			callback(null,newMachine);	
		}
		else{
			callback(-1); //return error
		}
	}
}

setInterval(updateHAList, 3000);
app.listen(process.env.PORT || 2002);
console.log('#########\nListening on ' + (process.env.PORT || 2002) + '\n##########');


//
// Addresses to use in the round robin proxy
//