var localSaveInterval = null;
var remoteSaveInterval = null;

/*
    This will save the document to local storage.
*/
saveLocalStorage = function() {
    //  Make sure user has local storage enabled.
    if (typeof(Storage) !== "undefined") {
        //  Get the html markup from the page
        var markup = $(".notebookEditableArea").html();
        if (markup != "") {
            //  Make a new document to save to local storage.
            var newDocument = {};
            newDocument.timestamp = new Date();
            newDocument.markup = markup;
            newDocument.title = $('.notebookTitle').val();
            newDocument.id = Session.get('document.currentID');
            //  If the document needs saving, then save it.
            if (needsSave(localStorage.lastDocument || {}, newDocument)) {
                localStorage.lastDocument = JSON.stringify(newDocument);
            }
        }
    }
};

/*
    Clear the local storage document
*/
clearLocalSaves = function() {
    //  Make sure local storage is enabled
    if (typeof(Storage) !== "undefined") {
        localStorage.lastDocument = null;
    }
};

/*
    Save the document to the server.
*/
saveRemoteStorage = function() {
    //  Get the user's temporary login information.
    token = getCookie("hive_auth_token");
    //  Get the currently loaded document's id.
    documentID = Session.get('document.currentID');
    /*  Make sure user is logged in, there is a document to save, 
        and that we aren't currently saving
    */
    if (token && documentID && getSaveStatus() != SAVE_STATUS.SAVING) {
        //  Before doing a remote save, check to see if some other user changed something
        var docNeedsSave = updateDocumentFromRemote();

        processIntelligence();

        //  Get the html version of the user's document.
        var markup = $(".notebookEditableArea").html();
        //  Make a document out of it and set some properties.
        var newDocument = {};
        newDocument.timestamp = new Date();
        newDocument.markup = markup;
        newDocument.title = $('.notebookTitle').val();
        newDocument.id = documentID;
        newDocument.revisions = [];

        //  Get the last saved document to compare with current.
        var previousDocument = Session.get("document.last") || {};

        if (previousDocument != {}) {
            //  Check to see if the previous document in session is some other doc
            if (previousDocument.id != documentID) {
                previousDocument = {};
                Session.set("document.last", null);
            }
        }

        newDocument.revisions = previousDocument.revisions || [];

        //  Check to see if we really need to save.
        var docNeedsSave = needsSave(previousDocument, newDocument);

        if (docNeedsSave == true) {
            //  Show the user that we are currently saving.
            setSaveStatus(SAVE_STATUS.SAVING);

            //  Create list of differences between the last save and the current markup.
            var dmp = new diff_match_patch();
            var diffs = dmp.diff_main(previousDocument.markup || '', newDocument.markup);

            //  Make a new revision for this document
            var revision = {};
            revision.diffs = diffs;
            revision.title = $('.notebookTitle').val();

            newDocument.revisions.push(revision);

            // Server-side database transaction that appends the revision remotely to the document.
            api_saveDocument(revision, documentID, function(error, result) {
                if (error) {
                    //  Show the user that something died
                    setSaveStatus(SAVE_STATUS.FAILED);
                } else {
                    //  Set the current document to be the last saved document
                    Session.set("document.last", newDocument);
                    //  Show the user that save was successful
                    setSaveStatus(SAVE_STATUS.SUCCESS);
                }
            });
        }
    } else if (!token) {
        // ERROR: Shouldn't get to this point.
        window.location.reload();
    } else {
        console.log("Aborting save because already saving.");
    }
};

/*
    This code will run right before the document gets saved
*/
processIntelligence = function() {
    //  Document markup
    var originalMarkup = $(".notebookEditableArea").html();

    var linkReplacedMarkup = replaceURLWithHTMLLinks(originalMarkup);
    console.log(originalMarkup == linkReplacedMarkup);
    if (originalMarkup != linkReplacedMarkup)
        updateEditorText(linkReplacedMarkup);
}


updateDocumentFromRemote = function() {
    var localDocument = Session.get("document.last") || {}
    var documentID = Session.get('document.currentID');
    var remoteDocument = Documents.findOne({
        couch_id: documentID
    });

    remoteDocument.id = remoteDocument.couch_id;
    if (remoteDocument && localDocument.revisions && remoteDocument.revisions.length > localDocument.revisions.length) {
        var newDocument = remoteDocument;
        var markup = rebuildDiffs(newDocument.revisions);
        newDocument.markup = markup;
        Session.set("document.last", newDocument);
        updateEditorText(newDocument.markup);
        console.log(remoteDocument.revisions.length + " != " + localDocument.revisions.length);
        return false;
    } else if (remoteDocument && localDocument.revisions && localDocument.revisions.length > remoteDocument.revisions.length) {
        return true;
    } else {
        return false;
    }
};

mergeDocuments = function(documentA, documentB) {
    var revisionDelta = documentA.revisions.length - documentB.revisions.length;
    if (revisionDelta > 0) {
        return documentA;
    } else {
        return documentB;
    }
};

createNewDocument = function(next) {
    // Get the user's temporary login information.
    token = getCookie("hive_auth_token");
    if (token) {
        var revision = {};
        revision.timestamp = new Date();
        revision.markup = "";
        revision.title = $('.notebookTitle').val();

        // Server-side database transaction that saves the document remotely.
        api_saveDocument(revision, null, function(error, result) {
            if (error) {
                next(error);
            } else {
                console.log("Created new document");
                console.log(result);
                next(null, result.id);
            }
        });
    } else {
        // ERROR: Shouldn't get to this point. 
        window.reload();
    }
};

/*
    This will start the interval to save remotely and locally
    every 500ms. We will eventually adjust this based on the 
    user's internet speeds.
*/
startSaveIntervals = function() {
    /*  If the intervals have already been set,
        we don't want to reset them. */
    clearSaveIntervals();
    // Local save the file every 500ms
    localSaveInterval = setInterval(function() {
        if (Session.get("currentView") == "editor") {
            saveLocalStorage();
        } else {
            clearSaveIntervals();
        }
    }, 500);
    // Remote save every 500ms.
    remoteSaveInterval = setInterval(function() {
        if (Session.get("currentView") == "editor") {
            saveRemoteStorage();
        } else {
            clearSaveIntervals();
        }
    }, 500);
};

/*
    Stop saving remotely and locally 
*/
clearSaveIntervals = function() {
    if (localSaveInterval) {
        clearInterval(localSaveInterval);
    }
    if (remoteSaveInterval) {
        clearInterval(remoteSaveInterval);
    }
};

/*
    Check to see if the string given is json
*/
IsJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

/*
    Given two documents, check to see if it needs a save
*/
needsSave = function(oldDocument, newDocument) {
    /*  If oldDocument and newDocument are null
            don't save.
        If oldDocument is null and newDocument is not null
            If newDocument.markup is not empty
                save.
            Else
                If newDocument.title is not empty
                    save.
                Else
                    don't save.
        If oldDocument is not null and newDocument is null
            If oldDocument.markup is not empty
                save.
            Else
                If newDocument.title is not empty
                    save.
                Else
                    don't save.
        If oldDocumet and newDocument are not null
            If oldDocument.markup != newDocument.markup
                save.
            Else
                If newDocument.title is not empty
                    save.
                Else
                    don't save.
    */

    if ((!oldDocument && !newDocument) || (!oldDocument && (!newDocument.markup || newDocument.markup == "") && (!newDocument.title || newDocument.title == "")) || (!newDocument && (!oldDocument || oldDocument.markup == "") && (!oldDocument.title || oldDocument.title == "")) || (newDocument.markup != null && oldDocument.markup != null && newDocument.markup == oldDocument.markup && newDocument.title == oldDocument.title)) {
        return false;
    } else {
        return true;
    }
}