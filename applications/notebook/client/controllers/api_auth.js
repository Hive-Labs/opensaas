/*
    Everything on this page handles the communication between
    the client and the server side code related to auth.
*/

/*
    When this function is given an authentication code, it will
    ask the server for an authentication token, and set this 
    in the cookies. It will return a "true" or a "false" to the 
    callback function.
*/
auth_tradeCode = function(code, next) {
    Meteor.call('auth_tradeCode', code, function(error, result) {
        if (!error && !(result instanceof AuthError)) {
            setCookie("hive_auth_token", result, 1);
            next(true);
        } else {
            next(false);
        }
    });
};

/*
    When this function is given an authentication token, it will
    ask the server whether the token is valid. It will return
    "true" or "false" indicating whether the token was valid.
*/
auth_testToken = function(token, next) {
    Meteor.call('auth_testToken', token, function(error, result) {
        if (!error && result == true) {
            next(true);
        } else {
            next(false);
        }
    });
};

/*
    When this function is given an authentication token, it will
    ask the server for the full details of the currently logged in
    user. It will first set the cookie "user.current" to the details
    of the user and then pass that result to the callback function.
*/
auth_loadUser = function(token, next) {
    Meteor.call('api_getUser', token, function(error, result) {
        Session.set("user.current", result);
        console.log(result);
        next(result);
    });
};

/*
    When this function is given an authentication token, it will
    ask the server for a list of all te users signed up for the
    notebook app. It will then pass the list of users to the
    callback function.
*/
api_getAllUsers = function(token, next) {
    Meteor.call('api_getAllUsers', token, function(error, result) {
        next(error, result);
    });
};