Meteor.methods({
    /*
        Given an auth token for a user, a revision, and a documentID, save the revision.
    */
    api_saveDocument: function(token, revision, documentID) {
        return api_saveDocument(token, revision, documentID);
    },

    //  Given a token and a documentID, it will return a document
    api_getDocument: function(token, documentID) {

        return api_getDocument(token, documentID);
    },

    //  Given a token and a documentID, it will delete that document.
    api_deleteDocument: function(token, documentID) {
        api_deleteDocument(token, documentID);
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
                var user = api_getUserByID(token, userID);
                user.privileges.writableDocuments.push(documentID);
                api_saveUser(user);

                /*  We need to get the document and add this user to the list
                        of users with permissions for that doc.
                    */
                var document = api_getDocument(token, documentID);
                document.writeAccessUsers.push(user._id);

                //  This is the url we have to post to the database so we can save the existing document.
                var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + documentID;

                //  We perform the post request to save this new document into the dbService.
                postRequest(config.dbServerHost, config.dbServerPort, url, document, function(err, result) {
                    if (!err) {
                        fut['return']("OK");
                    } else {
                        fut['return'](ParameterError("Invalid documentID."));
                    }
                });
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