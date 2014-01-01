module.exports = function(servConf, dbService) {
	var returnObj = {};
	var request = require('request');


	returnObj.index = function(req, res) {
		//Check if it is a callback from oAuth
		if (req.query.code) {
			//Exchange the auth_code for an auth_token
			exchangeToken("http://" + req.headers.host, req.query.code, function(access_token) {
				testToken(access_token, function(err, user) {
					if (user) {
						res.cookie('access_token', access_token, {
							maxAge: 900000
						});
						res.redirect('/');
					} else {
						logger.info("Client ID:");
						logger.info(servConf.get().server.oAuthClientID);
						res.render('login', {
							client_id: servConf.get().server.oAuthClientID,
							client_secret: servConf.get().server.oAuthClientSecret
						});
					}
				});
			});
		} else {
			testToken(req.cookies.access_token, function(error, user) {
				console.log(user);
				if (user) {
					res.render('index');
				} else {
					logger.info("Client ID:");
					logger.info(servConf.get().server.oAuthClientID);
					res.render('login', {
							client_id: servConf.get().server.oAuthClientID,
							client_secret: servConf.get().server.oAuthClientSecret
					});
				}
			});
		}
	};


	function exchangeToken(hostname, auth_code, callback) {
		var client_id = servConf.get().server.oAuthClientID;
		var client_secret = servConf.get().server.oAuthClientSecret;

		request.post('http://localhost:4455/oauth/token', {
			form: {
				client_id: client_id,
				client_secret: client_secret,
				code: auth_code,
				grant_type: 'authorization_code',
				redirect_uri: hostname
			}
		}, function(error, response, body) {
			if (!error && body && response.statusCode != 400) {
				callback(JSON.parse(body).access_token);
			} else {
				callback(null);
			}
		});
	}

	function testToken(auth_token, callback) {
		if (!auth_token) {
			request.get('http://localhost:4455/api/user?', function(error, response, body) {
				if (error || response.statusCode == 401 || response.statusCode == 404) {
					callback(null, null);
				} else {

					callback(null, JSON.parse(body));
				}
			});
		} else {
			request.get('http://localhost:4455/api/user?access_token=' + auth_token, function(error, response, body) {
				if (error || response.statusCode == 401) {
					callback(null, null);
				} else {
					callback(null, JSON.parse(body));
				}
			});
		}
	}

	return returnObj;
};