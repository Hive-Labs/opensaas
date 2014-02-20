/*
    Given an authentication token, we return a list of all the users
    using the notebook app
*/
api_getAllUsers = function(token) {
    var users = Users.find({}).fetch();
    if (users != null) {
        for (var i = 0; i < users.length; i++) {
            //  Return the cached copy of the document.
            users[i].id = users[i].couch_id;
            users[i]._id = users[i].couch_id;
            delete users[i].couch_id;
            delete users[i]._rev;
        }
        return users;
    } else {
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();
        try {
            //  This is the url to get a list of all the users from database
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users;
            //  We perform the request to get a list of all the users
            getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
                //  If there was no error, and result isn't null
                if (!err && result != null) {
                    //  Loop through and delete personal data before returning the list.
                    for (var i = 0; i < result.data.length; i++) {
                        //  We don't want to give someone access to another user's personal info
                        delete result.data[i].privileges;
                        delete result.data[i].notifications;
                    }
                    fut['return'](result.data);
                } else {
                    //  Some other error, so throw that back to client
                    fut['return'](DBError(err));
                }
            });
        } catch (e) {
            //  Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //  Wait for the asyncronous code to complete, and spit it back to client
        return fut.wait();
    }
};

/*
    Given an auth token, make a new user. Get the userID and the
    displayName from the auth service.
*/
api_createUser = function(token) {
    //  Get information about the user from the auth service
    var authServiceUser = auth_getUser(token);

    //  Make a new user using information from authService.
    var user = {
        _id: authServiceUser.user_id,
        privileges: {
            readableDocuments: [],
            writableDocuments: [],
            administrator: false
        },
        notifications: [
            config.messages.welcomeNotification
        ],
        displayName: authServiceUser.displayName,
        authServiceID: authServiceUser.user_id
    };

    var userID = user._id;
    delete user._id;
    //  Save this user to the temporary mongoDB database.
    Users.upsert({
        couch_id: userID
    }, user);

    user._id = userID;

    var error;

    //  This is the url we need to post to the dbService, to save that user
    var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users;

    //  We perform the post request to save this new user to the database
    postRequest(config.dbServerHost, config.dbServerPort, url, user, function(err, result) {
        error = error || err;
    });

    //  If there was an error, then return that
    if (error) {
        console.log("Error saving to database while creating user.");
        console.log(error);
    }

    return user;
};

/*
    Given an auth token, it will return the user associated with it.
*/
api_getUser = function(token) {
    try {
        //  Get the user from the auth server using the token.
        var user = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
        //  Lookup that user in notebook database
        return (api_getUserByID(token, user.data.user_id));
    } catch (e) {
        //  Something went wrong exchanging the given token for the user_id from the authService
        return (AuthError("Bad Token"));
    }
}

/*
    Given a userID, it will return information about that user.
*/
api_getUserByID = function(token, userID) {
    var user = Users.findOne({
        couch_id: userID
    });
    if (user != null) {
        //  Return a cached copy of the user
        user.id = userID;
        user._id = userID;
        delete user.couch_id;
        delete user._rev;
        return user;
    } else {
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();
        try {
            //  This is the url to get a user by their id.
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + userID;

            //  We perform the request to get this user from the database.
            getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
                //  Check if the callback function gives a connection error
                if (err) {
                    //  If the user doesn't exist, make a new one.
                    if (result != null && result.data.error == "not_found") {
                        console.log("User was not found, creating a new user.");
                        var newUser = api_createUser(token);
                        //  Return what the user asked for (a user)
                        fut['return'](newUser);
                    } else {
                        //  Some other error, so throw that back to client
                        fut['return'](DBError(err));
                    }
                } else {
                    //  Some error, so throw it back to the client
                    if (result.data != null && result.data.error) {
                        fut['return'](DBError(err));
                    } else {
                        var userID = result.data._id;
                        delete result.data._id;
                        delete result.data.id;
                        result.data.couch_id = userID;
                        //  Save this user to the temporary mongoDB database.
                        Users.insert(result.data);

                        result.data._id = userID;
                        result.data.id = userID;
                        delete result.data.couch_id;

                        fut['return'](result.data || {});
                    }
                }
            });
        } catch (e) {
            //  Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //  Wait for the asyncronous code to complete, and spit it back to client
        return fut.wait();
    }
}


/*
    Given a user, it will save it to the database. This assumes that
    user has a property "id" that can be used to save them to the database.
*/
api_saveUser = function(user) {
    //  Save this user to the temporary mongoDB database. 
    var userID = user._id;
    delete user._id;
    delete user.id;
    delete user_rev;
    user.couch_id = userID;
    //  Save this user to the temporary mongoDB database.
    Users.upsert({
        couch_id: userID
    }, user);
    delete user.couch_id;
    user._id = userID;
    user.id = userID;

    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var error;
    //  This is the url that will save the user to the database
    var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + user.authServiceID;

    //  We perform the post request to save that user to the database
    postRequest(config.dbServerHost, config.dbServerPort, url, user, function(err, result) {
        error = error || err;
    });

    //  Check to see if there are errors
    if (error) {
        console.log("Error saving to database.");
        console.log(error);
    }
    return user;
}

/*
    Given an auth token and a notification id, it will mark that notificationID 
    as read for that user. 
*/
api_dismissNotification = function(token, notificationID) {
    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();
    //  Get the user that you are modifying
    var user = api_getUser(token);
    //  Get the list of notifications they have
    var notifications = user.notifications;
    for (var i = 0; i < notifications.length; i++) {
        //  If the id matches the one you are looking for, mark it as read.
        if (notifications[i].id == notificationID) {
            notifications[i].read = true;
        }
    }

    user.notifications = notifications;
    api_saveUser(user);

    return fut.wait();
}