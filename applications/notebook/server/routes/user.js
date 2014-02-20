Meteor.methods({
    //  Given an auth token, it will return information about the user
    api_getUser: function(token) {
        return api_getUser(token);
    },
    //  Given an auth token and a user id to look up, it will return info about the given userID
    api_getUserByID: function(token, userID) {
        var user = api_getUserByID(token, userID);
        delete user.privileges;
        delete user.notifications;
        return user;
    },
    //  Given an auth token, it will return a list of all users in the notebook app
    api_getAllUsers: function(token) {
        return api_getAllUsers(token);
    },
    //  Given an auth token and a notificationID, it will mark that notification as read for the user
    api_dismissNotification: function(token, notificationID) {
        return api_dismissNotification(token, notificationID);
    }
});