Meteor.methods({
    //This method will be used by the client side to get all documents for a given user.
    api_getAllDocuments: function(token) {
        //Since the stuff underneath is asyncronous, you have to use futures.
        var fut = new Future();
        try {
            //First thing we do is get the user_id using the given token from the authServer.
            var result = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
            //This is the url wehave to post to the dbService, to get all documents for a given user
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + result.data.user_id;
            //We perform the request to get all documents for a given user from dbService
            getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
                //Check if the callback function gives a connection error
                if (err) {
                    //There are no documents for given user
                    if (result.data.error = "not_found") {
                        //Return null if nothing was found
                        fut['return']({});
                    } else {
                        //Some other error, so throw that back to client
                        fut['return'](DBError(err));
                    }
                } else {
                    //Some error, so throw it back to the client
                    if (result.data && result.data.error) {
                        fut['return'](DBError(err));
                    } else {
                        //yay, everything was ok, so return this list to the client
                        fut['return'](result.data || {});
                    }
                }
            });
        } catch (e) {
            //Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //Wait for the asyncronous code to complete, and spit it back to client
        return fut.wait();
    },
    //This method will be used by the client to add a new document to a given user.
    api_saveDocument: function(token, document) {
        //Since the stuff underneath is asyncronous, you have to use futures.
        var fut = new Future();
        try {
            //First thing we do is get the user_id using the given token from the authServer.
            var result = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
            //This is the url wehave to post to the dbService, to save the document into the given user
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + result.data.user_id;
            //We perform the post request to save this new document into the dbService
            postRequest(config.dbServerHost, config.dbServerPort, url, document, function(err, result) {
                //Check if the callback function gives a connection error
                if (err) {
                    //Tell the future to return an error
                    fut['return'](DBError(err));
                } else {
                    //Check if the callback function gives a database error
                    if (result.data && result.data.error) {
                        //Tell the future to return an error
                        fut['return'](DBError(err));
                    } else {
                        //Everything ok, return whatever the database gives (it usually returns OK).
                        fut['return'](result.data || {});
                    }
                }
            });
        } catch (e) {
            //Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //Return whatever the above asyncronous code set in the future
        return fut.wait();
    }
});