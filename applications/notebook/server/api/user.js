Meteor.methods({
    //  Given an auth token, it will return information about the user
    api_getUser: function(token) {
        return api_getUser(token);
    },
    //  Given an auth token and a user id to look up, it will return info about the given userID
    api_getUserByID: function(token, userID) {
        var user = api_getUserByID(userID);
        delete user.privileges;
        delete user.notifications;
        return user;
    },
    //  Given an auth token, it will return a list of all users in the notebook app
    api_getAllUsers: function(token) {
        return api_getAllUsers(token);
    }
});

/*
    Given an authentication token, we return a list of all the users
    using the notebook app
*/
api_getAllUsers = function(token) {
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
};

/*
    Given an auth token, make a new user. Get the userID and the
    displayName from the auth service.
*/
api_createUser = function(token) {
    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();

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

    var error;

    //  This is the url we need to post to the dbService, to save that user
    var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users;

    //  We perform the post request to save this new user to the database
    postRequest(config.dbServerHost, config.dbServerPort, url, user, function(err, result) {
        error = error || err;
    });

    //  If there was an error, then return that
    if (error) {
        fut['return'](DBError(error));
    } else {
        fut['return'](user);
    }

    return fut.wait();
};

/*
    Given an auth token, it will return the user associated with it.
*/
api_getUser = function(token) {
    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();
    try {
        //  Get the user from the auth server using the token.
        var user = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);

        //  This is the url to get a a user from the database, given an id
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + user.data.user_id;

        //  Perform the getRequest to get the user from the database
        getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
            //  Check for errors from database
            if (err) {
                //  Check to see if the user exists. If not, create a new user.
                if (result != null && result.data.error == "not_found") {
                    console.log("User was not found, creating a new user.");
                    fut['return'](api_createUser(token));
                } else {
                    //  Some other error, so throw that back to client
                    fut['return'](DBError(err));
                }
            } else {
                //  Some error, so throw it back to the client
                if (result.data != null && result.data.error) {
                    fut['return'](DBError(err));
                } else {
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

/*
    Given a userID, it will return information about that user.
*/
api_getUserByID = function(userID) {
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
                    fut['return'](api_createUser(token));
                } else {
                    //Some other error, so throw that back to client
                    fut['return'](DBError(err));
                }
            } else {
                //  Some error, so throw it back to the client
                if (result.data != null && result.data.error) {
                    fut['return'](DBError(err));
                } else {
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


/*
    Given a user, it will save it to the database. This assumes that
    user has a property "id" that can be used to save them to the database.
*/
api_saveUser = function(user) {
    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();
    var error;
    //  This is the url that will save the user to the database
    var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + user.authServiceID;

    //  We perform the post request to save that user to the database
    postRequest(config.dbServerHost, config.dbServerPort, url, user, function(err, result) {
        error = error || err;
    });

    //  Check to see if there are errors
    if (error) {
        console.log(error);
        fut['return'](DBError(error));
    } else {
        fut['return'](user);
    }

    return fut.wait();
}