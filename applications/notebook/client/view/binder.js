/*
    The binder page uses a template item for each document. We need to populate this list.
    The list of documents will always be stored in the session name document.list. 
*/
Template.documents.documents = function() {
    return Session.get("document.list");
};

/*
    This will get a list of all the documents from the server and format it
    so the day, month, and year are formatted nicely.
*/
loadDocuments = function(next) {
    //  If we are trying to get anything from the server, we need to provide the user's auth token.
    token = getCookie("hive_auth_token");
    //  Get a list of documents for that user.
    api_getAllDocuments(token, 20, function(err, documents) {
        //  Loop through each document item and do some sanitizing
        for (var i = 0; i < documents.length; i++) {
            if (Session.get("currentView") == "binder") {
                var document = documents[i];
                //  Month is usually from 1-12, so we have to associate each with a name
                var months = ["January", "February", "March", "April", "May", "June",
                    "July", "August", "September", "October", "November", "December"
                ];

                var today = new Date();

                //  Get the date the document was created
                var date = (new Date(document.creationTime));
                //  Extract year, month, and day from the date
                var year = date.getFullYear(),
                    month = months[date.getMonth()],
                    day = date.getDate();

                var properlyFormatted;
                if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate()) {
                    properlyFormatted = "Today";
                } else if (today.getFullYear() == date.getFullYear() && today.getMonth() == date.getMonth() && today.getDate() == date.getDate() + 1) {
                    properlyFormatted = "Yesterday";
                } else {
                    //  Prepend a 0 if the day is single digit
                    if (day < 10) day = "0" + day;

                    //  Final date is like: 0 December 2000
                    properlyFormatted = day + " " + month + " " + year;
                }



                //  Get the last revision from the document to get the last title of the document
                var lastRevision = document.revisions[document.revisions.length - 1];
                if (lastRevision) {
                    //  If the document doesn't have a title, set it to untitled
                    document.title = lastRevision.title || "Untitled";
                } else {
                    document.title = "Untitled";
                }

                document.formattedCreationTime = properlyFormatted;

                var currentUserID = Session.get("user.current")._id;
                for (var j = 0; j < document.currentlyWritingUsers.length; j++) {
                    if (document.currentlyWritingUsers[j] != currentUserID) {
                        document.color = "#159725";
                    }
                }


                documents[i] = document;
            }
        }

        //  We don't return the list, we just set this in session for other functions to use.
        Session.set("document.list", documents);
        //  Run the callback function.
        next();
    });
};

/*
    Give this function a document id and it will open up the editor page and set
    the document to that.
*/
loadDocument = function(documentID) {
    showNavBar();
    clearRefreshInterval();
    //  Before loading the document, we need to show the loading box
    showLoadingBox();
    /*  We are about to open a document, so set session variable document.currentID
        to that documentID
    */
    Session.set('document.currentID', documentID);
    //  Load the editor page (the functional part)
    loadEditorPage(function(error, document) {
        //  Load the UI part of the editor page 
        currentTemplate = Template.editor;
        template_changer.changed();
        setTimeout(function() {
            renderEditorPage(document);
            //  The UI is loaded, so get rid of the loading box
            hideLoadingBox();
        }, 50);
    });
};

/*
    Given a documentID, it will open up the box prompting the user to choose
    a user to share the document with.
*/
showDocumentShare = function(documentID) {
    //  We need the auth token of the user
    var token = getCookie("hive_auth_token");
    //  Ask the server for a list of all the users using notebook app
    api_getAllUsers(token, function(err, result) {
        //  Get the id of the currently logged in user
        var currentUser = Session.get("user.current");
        /*  Loop through the list of users and remove the current one from the list
            so the user doesn't end up sharing the document with themself.
        */
        for (var i = 0; i < result.length; i++) {
            if (result[i]._id == currentUser._id) {
                result.splice(i, 1);
            }
        }
        //  Show the dialog box containing the list of users you can share with.
        Template.users.users = result;
        Template.userItem.document = documentID;
        BootstrapDialog.show({
            title: 'Share with a friend',
            message: $(Template.users())
        });
    });
}