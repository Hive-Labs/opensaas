/*
    Given a documentID, it will return the document.
*/
api_getDocument = function(token, documentID) {
    var document = Documents.findOne({
        couch_id: documentID
    });
    if (document != null) {
        //  Return the cached copy of the document.
        document.id = documentID;
        document._id = documentID;
        delete document.couch_id;
        console.log("Getting document " + documentID + " from cache");
        return document;
    } else {
        console.log("Getting document " + documentID + " from DB");
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
                        //  Save it to the temporary mongoDB database.
                        delete result.data.id;
                        delete result.data._id;
                        result.data.couch_id = documentID;
                        //  Save it to the temporary mongoDB database.
                        Documents.insert(result.data);

                        result.data.id = documentID;
                        result.data._id = documentID;
                        delete result.data.couch_id;
                        //  Return what the user asked for (a document)
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

api_saveDocument = function(token, revision, documentID) {
    console.log("Saving Document: " + documentID);
    //  We need to get the userID attached with this given token from the auth server.
    var userID = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token).data.user_id;

    var document;
    var newDocument = false;

    //  Add some properties to the revision
    revision.authorID = userID;
    revision.modificationTime = new Date();

    /*  If the user gave us a documentID, then we need to save the revision to that ID.
            Otherwise, we need to make a new document and save the revision to that as the
            first revision. */
    if (documentID) {
        //  A documentID is given, so append this revision to that document.
        var document = api_getDocument(token, documentID);
        document.revisions.push(revision);
        //  Set the title of the document to the title of the last revision
        document.title = revision.title;

        /*  We need to go through the list of people editing the document, and
                remove people that are inactive
            */
        var newListOfActiveUsers = [];
        for (var i = 0; i < document.currentlyWritingUsers.length; i++) {
            var lastRevision = api_getLastRevisionByUser(document, document.currentlyWritingUsers[i]);
            var FIVE_MINUTES = 5 * 60 * 1000; /* ms */
            /*  If the user has made a change within the last five minutes, assume they are also
                    writing to the document.
                */
            if ((new Date) - new Date(lastRevision.modificationTime) < FIVE_MINUTES) {
                newListOfActiveUsers.push(document.currentlyWritingUsers[i]);
            }
        }

        document.currentlyWritingUsers = newListOfActiveUsers;

        if (document.currentlyWritingUsers.indexOf(userID) == -1) {
            document.currentlyWritingUsers.push(userID);
        }


        delete document.id;
        delete document._id;
        document.couch_id = documentID;
        //  Save it to the temporary mongoDB database.
        Documents.upsert({
            couch_id: documentID
        }, document);

        //document.id = documentID;
        document._id = documentID;
        delete document.couch_id;
        delete document._rev;
    } else {
        //  User didn't give us a document id, so make a new document.
        document = {
            revisions: [],
            title: revision.title,
            creationTime: new Date(),
            authorID: userID,
            readAccessUsers: [],
            writeAccessUsers: [userID],
            currentlyWritingUsers: [userID],
            currentlyReadingUsers: []
        };
        //  We need to do some things later since this is a new document.
        newDocument = true;
    }


    try {
        //  Everything below will be asyncronous, so we rely on futures to return a value.
        var fut = new Future();
        //  This is the url we have to post to the database so we can save the new document
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes;
        //  We perform the post request to save this new document into the dbService.
        postRequest(config.dbServerHost, config.dbServerPort, url, document, function(err, result) {
            //  Check if the database transaction gave an error.
            if (err) {
                //  return the user.
                console.log("There was an error saving document to database.");
                console.log(err);
                console.log("   Document Info:");
                console.log(document);
                fut['return'](DBError(err));
            } else {
                //  Check if the database transaction gave an error.
                if (userID && result.data.error) {
                    //Tell the future to return an error
                    console.log("There was an error saving document to database.");
                    console.log(err);
                    console.log("   Document Info:");
                    console.log(document);
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

                    //  Save it to the temporary mongoDB database.

                    var documentID = result.data.id;

                    delete result.data.id;
                    delete result.data._id;
                    delete result.data._rev;
                    result.data.couch_id = documentID;
                    //  Save it to the temporary mongoDB database.
                    Documents.upsert({
                        couch_id: documentID
                    }, result.data);

                    result.data.id = documentID;
                    result.data._id = documentID;
                    delete result.data.couch_id;

                    fut['return'](result.data || {});
                }
            }
        });
    } catch (e) {
        //  Something went wrong exchanging the given token for the user_id from the authService
        fut['return'](AuthError("Bad Token"));
    }

    //  If the document already has an id, then return it to user.
    if (document._id) {
        console.log("Returning cached copy of the document after save.");
        return document;
    }
    //  Document isn't ready yet, so wait for database transaction to finish.
    else {
        //  Return whatever the above asyncronous code set in the future
        return fut.wait();
    }
}

api_deleteDocument = function(token, documentID) {
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
        } catch (e) {
            //  Something went wrong exchanging the given token for the user_id from the authService
            console.log("Error deleting document: Bad Token");
        }

    } else {
        return ParameterError("DocumentID was null.");
    }

    console.log("Removed document.");
    return "OK";
}

/*
    Given a document (not an ID), and a userID, it will return the
    last revision made by that given userID.
*/
api_getLastRevisionByUser = function(document, userID) {
    //  We will start from the end of the revision list and work backwards searching for user
    for (var i = document.revisions.length - 1; i >= 0; i--) {
        if (document.revisions[i].authorID == userID) {
            return document.revisions[i];
        }
    }
    return null;
}