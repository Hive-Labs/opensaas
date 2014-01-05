auth_tradeCode = function(code, next){
	Meteor.call('auth_tradeCode', code, function(error, result){
		if(!(result instanceof AuthError)){
			console.log(result);
			setCookie("hive_auth_token", result, 1);
			next(true);
		}
		else{
			next(false);
		}	
	});
};

auth_testToken = function(token, next){
	Meteor.call('auth_testToken', token, function(error, result){
		console.log(result);
		if(result == true){
			next(true);
		}
		else{
			next(false);
		}	
	});
};
