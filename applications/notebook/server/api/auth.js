/*
    Given an auth token, it will return information about the user from the authServer.
*/
auth_getUser = function(token) {
    try {
        var result = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
        if (result.statusCode == 200 && result.data) {
            return result.data;
        } else {
            return AuthError(result.content);
        }
    } catch (e) {
        return AuthError("Bad Token");
    }
};