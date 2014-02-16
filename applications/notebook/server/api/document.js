Meteor.methods({
    /*
        Given an auth token for a user, a revision, and a documentID, save the revision.
    */
    api_saveDocument: function(token, revision, documentID) {
        console.log("Saving Document: " + documentID);
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();
        //  We need to get the userID attached with this given token from the auth server.
        var userID = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token).data.user_id;

        var document;
        var newDocument = false;

        /*  If the user gave us a documentID, then we need to save the revision to that ID.
            Otherwise, we need to make a new document and save the revision to that as the
            first revision. */
        if (documentID) {
            //  A documentID is given, so append this revision to that document.
            var document = api_getDocument(token, documentID);
            document.revisions.push(revision);
            //  Set the title of the document to the title of the last revision
            document.title = revision.title;
        } else {
            //  User didn't give us a document id, so make a new document.
            document = {
                revisions: [],
                title: revision.title,
                creationTime: new Date(),
                authorID: userID
            };
            //  We need to do some things later since this is a new document.
            newDocument = true;
        }

        try {
            //  This is the url we have to post to the database so we can save the new document
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes;
            //  We perform the post request to save this new document into the dbService.
            postRequest(config.dbServerHost, config.dbServerPort, url, document, function(err, result) {
                //  Check if the database transaction gave an error.
                if (err) {
                    //  return the user.
                    fut['return'](DBError(err));
                } else {
                    //  Check if the database transaction gave an error.
                    if (userID && result.data.error) {
                        //Tell the future to return an error
                        fut['return'](DBError(err));
                    } else {
                        /*  If this document was just created, we need to add it to the allowed
                            documents the user can access. */
                        if (newDocument) {
                            //  Get the user that we want to give access to this document
                            var user = api_getUser(token);
                            //  Give that user write privileges to this document
                            user.privileges.writableDocuments.push(result.data.id);
                            api_saveUser(user);
                        }
                        //  Everything ok, so return whatever the database gives (it usually returns OK).
                        fut['return'](result.data || {});
                    }
                }
            });
        } catch (e) {
            //  Something went wrong exchanging the given token for the user_id from the authService
            fut['return'](AuthError("Bad Token"));
        }
        //  Return whatever the above asyncronous code set in the future
        return fut.wait();
    },

    //  Given a token and a documentID, it will return a document
    api_getDocument: function(token, documentID) {
        return api_getDocument(token, documentID);
    },

    //  Given a token and a documentID, it will delete that document.
    api_deleteDocument: function(token, documentID) {
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();

        //  We need to get the userID attached with the given token.
        var userID = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token).data.user_id;

        //  Check if client gave a documentID to delete.
        if (documentID) {
            try {
                /*  Rather than deleting the document itself, we are removing it from the user's 
                    readable and writeable list. */
                var user = api_getUser(token);
                //  Remove it from user's readableDocuments list.
                var pos = user.privileges.readableDocuments.indexOf(documentID);
                if (~pos) {
                    user.privileges.readableDocuments.splice(pos, 1);
                }
                //  Remove it from the user's writableDocuments list.
                pos = user.privileges.writableDocuments.indexOf(documentID);
                if (~pos) {
                    user.privileges.writableDocuments.splice(pos, 1);
                }
                //  Save that modified user to the database.
                api_saveUser(user);
                fut['return']("OK");

            } catch (e) {
                //  Something went wrong exchanging the given token for the user_id from the authService
                fut['return'](AuthError("Bad Token"));
            }

        } else {
            fut['return'](ParameterError("DocumentID was null."));
        }

        //  Return whatever the above asyncronous code set in the future
        return fut.wait();
    },

    /*
        Given a documentID and a userID, it will give the second user write access to the document
    */
    api_shareDocument: function(token, documentID, userID) {
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();
        //  Check to see if the user gave a documentID
        if (documentID) {
            try {
                //  We will give write access to the second user
                var user = api_getUserByID(userID);
                user.privileges.writableDocuments.push(documentID);
                api_saveUser(user);
                fut['return']("OK");

            } catch (e) {
                //  Something went wrong exchanging the given token for the user_id from the authService
                fut['return'](AuthError("Bad Token"));
            }

        } else {
            fut['return'](ParameterError("DocumentID was null."));
        }

        //  Return whatever the above asyncronous code set in the future
        return fut.wait();
    }
});

/*
    Given a documentID, it will return the document.
*/
function api_getDocument(token, documentID) {
    //  Everything below will be asyncronous, so we rely on futures to return a value.
    var fut = new Future();
    try {
        //  Get the user from the given token.
        var user = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);

        //  This is the url to get a document given an ID, from the database
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + documentID;

        //  We perform the request to get this document from dbService
        getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
            //  Check if the callback function gives a connection error
            if (err) {
                //  There are no documents for given user
                if (result != null && result.data.error == "not_found") {
                    //  Return null if nothing was found
                    fut['return']({});
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