Meteor.methods({
    /*
        Given an auth code, this function will return an auth token.
    */
    auth_tradeCode: function(code) {
        //  Make a call to the auth server and do the oAuth request
        var client_id = config.authClientID;
        var client_secret = config.authClientSecret;
        var redirect_uri = config.authRedirectURI;
        var result = Meteor.http.call('POST', config.authServerHost + ':' + config.authServerPort + '/oauth/token', {
            data: {
                client_id: client_id,
                client_secret: client_secret,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: redirect_uri,
            }
        });
        //  Do some error checking and return the value
        if (result.data) {
            return result.data.access_token;
        } else {
            return (new AuthError("Bad Code"));
        }
    },
    /*
        Given an auth token, do a call to the auth server to see 
        if it is a valid token.
    */
    auth_testToken: function(token) {
        try {
            var result = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
            if (result.statusCode == 200 && result.data) {
                return true;
            } else {
                return AuthError(result.content);
            }
        } catch (e) {
            return AuthError("Bad Token");
        }
    }
});