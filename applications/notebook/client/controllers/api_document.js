/*
    Everything on this page handles the communication between
    the client and the server side code related to documents.
*/

/*
    When this function is given an authentication token, it will
    get a list of documentID's that are associated with that user's
    account. Then, it will get each document from the server and 
    pass a list of full documents to the callback function.
*/
api_getAllDocuments = function(maxResults, next) {
    var token = getCookie("hive_auth_token");

    Meteor.call('api_getUser', token, function(error, result) {
        //  This is the list of documents that will be returned.
        documentResults = [];
        if (result != null) {
            var totalDocuments = result.privileges.readableDocuments.length + result.privileges.writableDocuments.length
            if (totalDocuments == 0) {
                next(null, []);
            }
            //  Loop through each readable documentID, get it, and add it to the list.
            for (var readableDocumentID in result.privileges.readableDocuments) {
                if (documentResults.length < maxResults) {
                    //  We need to get the full document from the id.
                    api_getDocument(result.privileges.readableDocuments[readableDocumentID],
                        function(error, result) {
                            if (!error) {
                                result.readable = true;
                                result.writable = false;
                                documentResults.push(result);
                                if (documentResults.length == totalDocuments) {
                                    next(null, documentResults);
                                }
                            }
                        });
                }
            }
            //  Loop through each writable documentID, get it, and add it to the list.
            for (var writableDocumentID in result.privileges.writableDocuments) {
                if (documentResults.length < maxResults) {
                    //  We need to get the full document from the id.
                    api_getDocument(result.privileges.writableDocuments[writableDocumentID], function(error, result) {
                        if (!error) {
                            result.readable = true;
                            result.writable = true;
                            documentResults.push(result);
                            if (documentResults.length == totalDocuments) {
                                next(null, documentResults);
                            }
                        }
                    });
                }
            }
        }
    });
};

/*
    When this function is given an authentication token, and
    a document id, it will get that document from the server.
    If the user does not have previliges, it will return an error.
*/
api_getDocument = function(documentID, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_getDocument', token, documentID, function(error, result) {
        next(error, result);
    });
};

/*
    When this function is given an authentication token, and
    a document id, it will delete that document from the server.
    If the user does not have previliges, it will return an error.
*/
api_deleteDocument = function(documentID, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_deleteDocument', token, documentID, function(error, result) {
        next(error, result);
    });
};

/*
    When this function is given an authentication token,
    a document revision, and a document id, it will save that revision 
    to that document that is owned by the given user. 
    If the user does not have previliges, it will return an error.
*/
api_saveDocument = function(revision, documentID, next) {
    var token = getCookie("hive_auth_token");
    console.log(documentID);
    Meteor.call('api_saveDocument', token, revision, documentID, function(error, result) {
        next(error, result);
    });
};

/*
    When this function is given an authentication token,
    a document id, and another user's id, it will share the 
    document with the given id with another user with the given
    id. If the user does not have previliges, it will return an error.
*/
api_shareDocument = function(documentID, userID, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_shareDocument', token, documentID, userID, function(error, result) {
        next(error, result);
    });
};