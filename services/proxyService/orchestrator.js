var request = require('request');

var orchestratorIP;
exports.orchestratorIP  = orchestratorIP;

exports.init  =function(orchestratorIP){
	this.orchestratorIP = orchestratorIP;
}

exports.getHAList = function(callback){
	request.get(exports.orchestratorIP + "/runner/HAList", function (error, response, body) {
        callback(body);
    });
}