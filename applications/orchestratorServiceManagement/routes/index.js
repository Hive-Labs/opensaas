var request = require('request');


exports.index = function(req, res) {
	//Check if it is a callback from oAuth
	console.log(req.url);
	if (req.query.code) {
		//Exchange the auth_code for an auth_token
		exchangeToken(req.query.code, function(access_token) {
			console.log(access_token);
			testToken(access_token, function(valid){
				if(valid){
					res.cookie('access_token', access_token, { maxAge: 900000 });
					res.redirect('/');
				}
				else{
					res.render('login');
				}
			});
		});
	} else if (req.cookies.access_token) {
		testToken(req.cookies.access_token, function(valid){
				if(valid){
					res.render('index');
				}
				else{
					res.render('login');	
				}
			});
	}
	else{
		res.render('login');	
	}
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

