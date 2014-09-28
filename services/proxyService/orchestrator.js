module.exports = function(servConf) {
	var request = require('request');
    return {
        getHAList: function(callback) {
            request.get(servConf.get().services.orchestrator.host + "/runners?only_proxy=true", function(error, response, body) {
                if (body) {
                    callback(null, body);
                } else {
                    callback(error);
                }
            });
        }
    };
};