/*
    Given an authentication token, we return a list of all the users
    using the notebook app
*/
api_getAllUsers = function(token, forceGet) {
    var users = Users.find({}).fetch();
    if (users != null && !forceGet) {
        for (var i = 0; i < users.length; i++) {
            //  Return the cached copy of the document.
            users[i].id = users[i].couch_id;
            users[i]._id = users[i].couch_id;
            delete users[i].couch_id;
            delete users[i]._rev;
        }
        return users;
    } else {
        console.log("Getting list of users");
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
                        //  We don't want to give someone access to another user's personal informatio
                        result.data[i].couch_id = result.data[i].id;
                        delete result.data[i].id;
                        Users.insert(result.data[i]);
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
        authServiceID: authServiceUser.user_id,
        schoolMajor: "",
        schoolyear: "",
        university: "",
        onBoarded: false
    };

    var userID = user._id;
    delete user._id;
    //  Save this user to the temporary mongoDB database.
    Users.upsert({
        couch_id: userID
    }, user);


    var newUserFeed = {
        owner: userID,
        permission: ["*"],
        text: "just joined NoteBook."
    };
    api_submitFeed(token, newUserFeed);

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


/*
    Given an auth token, this will onboard the user with the given profile
    information. 
    onBoardingData: {
        displayName: "Rohit Krishnan",
        university: "University Of Massachusetts Lowell",
        schoolYear: "Sophomore",
        schoolMajor: "Computer Science, Magic"
    }
*/
api_onBoarding = function(token, onBoardingData) {
    var user = api_getUser(token);
    if (onBoardingData) {
        user.displayName = onBoardingData.displayName;
        user.university = onBoardingData.university;
        user.schoolYear = onBoardingData.schoolYear;
        user.schoolMajor = onBoardingData.schoolMajor;
        user.onBoarded = true;
        api_saveUser(user);
    }
}

api_getProfilePicturePathWithID = function(userID) {
    var fs = Npm.require('fs');

    //  Check to see if the mongoDB has a copy of the profile picture
    var profilePicture = ProfilePics.findOne({
        user_id: userID
    });

    //  If there is a cached copy of the picture
    if (profilePicture != null && profilePicture.path != null) {
        console.log("Returning a cached copy of profile picture.");
        //  The path might exist in database but not the actual file
        if (!fs.existsSync(profilePicture.path)) {
            //  If it  is an invalid path, remove it and retry everything.
            ProfilePics.remove({
                user_id: userID
            });
            return api_getProfilePicturePathWithID(userID);
        } else {
            //  If valid path, then return that
            return profilePicture.path;
        }
    } else {
        var asyncDownloadFunction = function(userID, callback) {
            //  We use this package to talk to dbServer through REST API
            var request = Npm.require('request');
            //  Remove the file if it exists
            var path = Npm.require('path').resolve('.', config.temporaryPaths.profilePicture + userID);
            if (fs.existsSync(path) == true) {
                console.log("Deleting old file.");
                fs.unlinkSync(path);
            }
            //  Get the file from the dbServer and save it to local filesystem
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + userID + "/attachments/profilepic";
            var reqStream = request.get(config.dbServerHost + ":" + config.dbServerPort + url);
            reqStream.on('end', function() {
                if (callback != null)
                    callback(null, path);
            });

            reqStream.on('error', function() {
                console.log("Error!!!");
                if (callback != null)
                    callback("error", null);
            });
            reqStream.pipe(fs.createWriteStream(path));

        };

        var asyncCropFunction = function(userID, callback) {
            var path = Npm.require('path').resolve('.', config.temporaryPaths.profilePicture + userID);
            var pathCropped = Npm.require('path').resolve('.', config.temporaryPaths.profilePictureCropped + userID);
            var easyimg = Meteor.require('easyimage');
            easyimg.rescrop({
                    src: path,
                    dst: pathCropped,
                    width: 100,
                    height: 100,
                    cropwidth: 100,
                    cropheight: 100,
                    x: 0,
                    y: 0
                },
                function(err, image) {
                    if (!err && callback != null)
                        callback(null, pathCropped);
                }
            );
        };

        var syncDownloadFunction = Meteor._wrapAsync(asyncDownloadFunction);
        var syncCropFunction = Meteor._wrapAsync(asyncCropFunction);

        var path = syncDownloadFunction(userID);
        path = syncCropFunction(userID);

        console.log("Cached and cropped profile picture to " + path);
        ProfilePics.upsert({
            user_id: userID
        }, {
            path: path,
            user_id: userID
        });

        return path;
    }
}

api_downloadAllProfilePics = function() {
    console.log("Downloading all profile pictures.");
    var users = api_getAllUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].onBoarded == true)
            api_getProfilePicturePathWithID(users[i].id);
    }
}