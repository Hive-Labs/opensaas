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
auth_testToken = function(next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('auth_testToken', token, function(error, result) {
        if (!error && result == true) {
            next(true);
        } else {
            next(false);
        }
    });
};