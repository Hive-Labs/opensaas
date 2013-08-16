var request = require('request');


exports.userInfo = function(req, res) {
	if (req.cookies.access_token) {
		testToken(req.cookies.access_token, function(valid){
				if(valid){
					res.end(JSON.stringify({fullName:"emarcoux"}));
				}
				else{
					res.redirect(301, 'http://localhost:3000/');
				}
		});
	}
	else{
		res.render('login');	
	}
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
		if(!error && body && response.statusCode != 400){
			callback(JSON.parse(body).access_token);
		}
		else{
			callback(null);
		}
	});
}

function testToken(auth_token, callback){
	request.get('http://localhost:4455/api/auth_test?access_token=' + auth_token,
		function(error, response, body) {
			if(error || response.statusCode == 400){
				callback(false);
			}
			else{
				callback(JSON.parse(body).valid);		
			}
		});
}

