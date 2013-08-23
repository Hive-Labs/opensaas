var request = require('request');


exports.userInfo = function(req, res) {
	testToken(req.cookies.access_token, function(err, user) {
		if (user) {
			res.end(JSON.stringify(user));
		} else {
			res.redirect(301, 'http://localhost:3000/');
		}
	});
};

exports.logout = function(req, res) {
	res.clearCookie('access_token');
	res.redirect(301, 'http://localhost:3000/');
};

function exchangeToken(auth_code, callback) {
	var client_id = "notoja-frontend";
	var client_secret = "1secret";


	request.post('http://localhost:4455/oauth/access_token', {
		form: {
			client_id: client_id,
			client_secret: client_secret,
			code: auth_code
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
			if (error || response.statusCode == 401) {
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