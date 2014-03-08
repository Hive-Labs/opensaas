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
    },
    //  This will be the route to onBoard the user's profile
    api_onBoarding: function(token, onBoardingData) {
        return api_onBoarding(token, onBoardingData);
    }
});

Router.map(function() {
    this.route('getProfilePic', {
        path: '/api/users/:_id/profilepic',
        where: 'server',
        action: function() {
            if (this.request.method == "GET") {
                var fstream = Npm.require('fs');
                //  User needs to give an auth token
                var token = readCookie("hive_auth_token", this.request);
                var response = this.response;
                //response.end('Pic');
                //  Get the user associated with this token
                var user = api_getUser(token);
                //  See if user exists
                if (user != null) {
                    var path = api_getProfilePicturePathWithID(this.params._id);
                    console.log("Path=" + path);
                    // path = "/home/rohit/Pictures/editorPage.png";
                    if (path != null) {
                        this.response.end(fstream.readFileSync(path));
                    } else {
                        this.response.end();
                    }
                } else {
                    response.writeHead(400, {
                        'Content-Type': 'text/html'
                    });
                    this.response.end('User does not exist or bad auth token was provided.');
                }
            }
        }
    });
});


Router.map(function() {
    //  This will map to the user uploading a profile picture
    this.route('user/profilepic', {
        //  Only execute this on the server (precautionary)
        where: 'server',
        //  Run this function when the user hits this url
        action: function() {
            //  Make sure its a post request
            if (this.request.method == "POST") {
                //  Check to see if a file was given
                if (this.request.files.files != null && this.request.files.files.length > 0) {
                    //  Check the path to the file that was just uploaded
                    var tempPath = this.request.files.files[0].path;
                    var token = readCookie("hive_auth_token", this.request);
                    //  Get the user associated with this token
                    var user = api_getUser(token);
                    //  See if user exists
                    if (user != null) {
                        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.users + "/" + user.id + "/attachments/profilepic";
                        var http = Npm.require('http');
                        var fs = Npm.require("fs");
                        var FormData = Meteor.require('form-data');
                        var fileStream = fs.createReadStream(tempPath);
                        var stat = fs.statSync(tempPath);
                        var form = new FormData();
                        form.append('file', fileStream);
                        var headers = form.getHeaders();
                        headers["content-length"] = stat.size;
                        setTimeout(function() {
                            var request = http.request({
                                method: 'POST',
                                host: config.dbServerHost.replace("http://", ""),
                                port: config.dbServerPort,
                                path: url,
                                headers: form.getHeaders()
                            });

                            request.on('error', function(e) {
                                console.log('problem with request: ' + e.message);
                            });

                            form.pipe(request);

                        }, 1000);

                        var asyncCropFunction = function(param, callback) {
                            var pathCropped = Npm.require('path').resolve('.', config.temporaryPaths.profilePictureCropped + param.userID);
                            var easyimg = Meteor.require('easyimage');
                            easyimg.rescrop({
                                    src: param.path,
                                    dst: pathCropped,
                                    width: 100,
                                    height: 100,
                                    cropwidth: 100,
                                    cropheight: 100,
                                    x: 0,
                                    y: 0
                                },
                                function(err, image) {
                                    if (err) throw err;
                                    if (callback != null)
                                        callback(null, pathCropped);
                                }
                            );
                        };

                        var syncCropFunction = Meteor._wrapAsync(asyncCropFunction);

                        var path = syncCropFunction({
                            path: tempPath,
                            userID: user.id
                        });

                        ProfilePics.upsert({
                            user_id: user.id
                        }, {
                            path: path,
                            user_id: user.id
                        });

                        console.log("Profile picture uploaded.");
                    }
                }
            } else if (this.request.method == "GET") {
                var fstream = Npm.require('fs');
                //  User needs to give an auth token
                var token = readCookie("hive_auth_token", this.request);
                var response = this.response;
                //response.end('Pic');
                //  Get the user associated with this token
                var user = api_getUser(token);
                //  See if user exists
                if (user != null) {
                    var path = api_getProfilePicturePathWithID(user.id);
                    console.log("Path=" + path);
                    // path = "/home/rohit/Pictures/editorPage.png";
                    if (path != null) {
                        this.response.end(fstream.readFileSync(path));
                    } else {
                        this.response.end();
                    }

                } else {
                    response.writeHead(400, {
                        'Content-Type': 'text/html'
                    });
                    this.response.end('User does not exist or bad auth token was provided.');
                }
            }
            // do whatever
        }
    });
});