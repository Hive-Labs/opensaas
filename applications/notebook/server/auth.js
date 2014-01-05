Meteor.methods({
  auth_tradeCode: function (code) {
    var client_id = config.authClientID;
    var client_secret = config.authClientSecret;
    var redirect_uri = config.authRedirectURI;
    var result = Meteor.http.call('POST',config.authServerHost + '/oauth/token', {
      data: {
        client_id: client_id,
        client_secret: client_secret,
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: redirect_uri,
      }
    });
    if (result.data) {
        return result.data.access_token;
    } else {
        return (new AuthError("Bad Code"));
    }
  },
  auth_testToken: function (token) {
    try{
      var result = Meteor.http.get(config.authServerHost + '/api/user?access_token=' + token);
      if (result.statusCode == 200 && result.data) {
        return true;
      } else {
        return AuthError(result.content);
      }  
    }
    catch(e){
      return AuthError("Bad Token");
    }
  },
  auth_loadUser: function (token) {
    try{
      var result = Meteor.http.get(config.authServerHost + '/api/user?access_token=' + token);
      if (result.statusCode == 200 && result.data) {
        return result.data;
      } else {
        return AuthError(result.content);
      }  
    }
    catch(e){
      return AuthError("Bad Token");
    }
  }
});