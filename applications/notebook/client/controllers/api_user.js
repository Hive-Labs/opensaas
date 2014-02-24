/*
    When this function is given an authentication token, it will
    ask the server for the full details of the currently logged in
    user. It will first set the cookie "user.current" to the details
    of the user and then pass that result to the callback function.
*/
auth_loadUser = function(next) {
    var token = getCookie("hive_auth_token");
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
api_getAllUsers = function(next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_getAllUsers', token, function(error, result) {
        next(error, result);
    });
};

/*
    When this function is given an authentication token and a userID, it will
    ask the server and return more information about given userID.
*/
api_getUserByID = function(userID, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_getUserByID', token, userID, function(error, result) {
        next(error, result);
    });
};
/*
    This function will mark a notification for a user as read.
*/
api_dismissNotification = function(notificationID, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_dismissNotification', token, notificationID, function(error, result) {
        next(error, result);
    });
};

/*
    Given the user's profile information, it will save it to the user's account.
*/
api_onBoarding = function(onBoardingData, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_onBoarding', token, onBoardingData, function(error, result) {
        next(error, result);
    });
}