Meteor.methods({
    //This method will be used by the client side to get all documents for a given user.
    api_getAllDocuments: function(token) {
        //Everything below will be asyncronous, so we rely on futures to return a value.
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
                        fut['return']([]);
                    } else {
                        //Some other error, so throw that back to client
                        fut['return'](DBError(err));
                    }
                } else {
                    //Some error, so throw it back to the client
                    if (result.data && result.data.error) {
                        fut['return'](DBError(err));
                    }
                    fut['return'](result.data || {});
                }
            });
        } catch (e) {
            //Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //Wait for the asyncronous code to complete, and spit it back to client
        return fut.wait();
    },
    //This method will be used by the client to save an existing document to a user.
    api_saveDocument: function(token, revision, documentID) {
        //Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();

        //First thing we do is trade the given token for a user_id with the auth server.
        var userID = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token).data.user_id;

        //Sanitize the input revision
        revision.authorID = userID;
        revision.modificationTime = new Date();

        var document;

        if (documentID) {
            //A documentID is given, so append this revision to that document.
            var document = api_getDocument(token, documentID);
            document.revisions.push(revision);
            document.title = document.revisions[document.revisions.length - 1].title;
        } else {
            //Create a new document
            document = {
                revisions: [],
                title: revision.title,
                creationTime: new Date(),
                authorID: userID
            };
        }

        try {
            //This is the url wehave to post to the dbService, to save the document into the given user
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + userID;
            //We perform the post request to save this new document into the dbService
            postRequest(config.dbServerHost, config.dbServerPort, url, document, function(err, result) {
                //Check if the callback function gives a connection error
                if (err) {
                    //Tell the future to return an error
                    fut['return'](DBError(err));
                } else {
                    //Check if the callback function gives a database error
                    if (userID && result.data.error) {
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
    },
    //This method will be used to get a specific document.
    api_getDocument: function(token, documentID) {
        return api_getDocument(token, documentID);
    },
    //This method will be used to delete a specific document.
    api_deleteDocument: function(token, documentID) {
        //Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();

        //First thing we do is trade the given token for a user_id with the auth server.
        var userID = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token).data.user_id;

        if (documentID) {
            try {
                //This is the url wehave to post to the dbService, to save the document into the given user
                var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + userID + "/" + documentID;
                //We perform the post request to save this new document into the dbService
                deleteRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
                    //Check if the callback function gives a connection error
                    if (err) {
                        //Tell the future to return an error
                        fut['return'](DBError(err));
                    } else {
                        //Check if the callback function gives a database error
                        if (userID && result.data.error) {
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

        } else {
            fut['return'](ParameterError("DocumentID was null."));
        }

        //Return whatever the above asyncronous code set in the future
        return fut.wait();
    }
});

function api_getDocument(token, documentID) {
    //Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();
    try {
        //First thing we do is trade the given token for a user_id with the auth server.
        var user = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);

        //This is the url to get a document for a given user
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + user.data.user_id + "/" + documentID;

        //We perform the request to get this document from dbService
        getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
            //Check if the callback function gives a connection error
            if (err) {
                //There are no documents for given user
                if (result.data && result.data.error == "not_found") {
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
}