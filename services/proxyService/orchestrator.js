var request = require('request');

var orchestratorIP;
exports.orchestratorIP  = orchestratorIP;

exports.init  =function(orchestratorIP){
    this.orchestratorIP = orchestratorIP;
};

exports.getHAList = function(callback){
    request.get(exports.orchestratorIP + "/runners?only_proxy=true", function (error, response, body) {
        if(body){
            callback(null, body);         
        }
        else{
            callback(error);
        }
    });
};