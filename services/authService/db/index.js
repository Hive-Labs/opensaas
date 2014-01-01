module.exports = function(dbService, logger){
	var returnObj = {};
	returnObj.users = require('./users')(dbService, logger);
	returnObj.clients = require('./clients');
	returnObj.accessTokens = require('./accesstokens');
	returnObj.authorizationCodes = require('./authorizationcodes');	
	return returnObj;
}
