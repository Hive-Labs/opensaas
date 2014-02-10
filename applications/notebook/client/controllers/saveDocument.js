var localSaveInterval = null;
var remoteSaveInterval = null;

saveLocalStorage = function() {
    //Make sure local storage is enabled
    if (typeof(Storage) !== "undefined") {
        //if there is a document already there
        if (localStorage.lastDocument && IsJsonString(localStorage.lastDocument)) {
            var markup = $(".notebookEditableArea").html();
            var newDocument = {};
            newDocument.timestamp = new Date();
            newDocument.markup = markup;
            newDocument.title = $('.notebookTitle').val();
            newDocument.id = Session.get('document.currentID');

            //check to see if we really need to save
            var docNeedsSave = needsSave(JSON.parse(localStorage.lastDocument), newDocument);
            if (docNeedsSave == true) {
                localStorage.lastDocument = JSON.stringify(newDocument);
            }
        } else {
            var markup = $(".notebookEditableArea").html();
            if (markup != "") {
                var newDocument = {};
                newDocument.timestamp = new Date();
                newDocument.markup = markup;
                newDocument.title = $('.notebookTitle').val();
                newDocument.id = Session.get('document.currentID');

                localStorage.lastDocument = JSON.stringify(newDocument);
            }
        }

    }
};

clearLocalSaves = function() {
    //Make sure local storage is enabled
    if (typeof(Storage) !== "undefined") {
        //if there is a document already there
        localStorage.lastDocument = null;
    }
};

saveRemoteStorage = function() {
    // Get the user's temporary login information.
    token = getCookie("hive_auth_token");
    // Get the currently loaded document's id.
    documentID = Session.get('document.currentID');
    if (token && documentID && getSaveStatus() != SAVE_STATUS.SAVING) {
        console.log("saving remote storage.");
        var markup = $(".notebookEditableArea").html(); // Markup contains user note-content.
        var newDocument = {};
        newDocument.timestamp = new Date();
        newDocument.markup = markup;
        newDocument.title = $('.notebookTitle').val();

        var previousDocument = Session.get("document.last") || {};
        //check to see if we really need to save
        var docNeedsSave = needsSave(previousDocument, newDocument);

        if (docNeedsSave == true) {
            setSaveStatus(SAVE_STATUS.SAVING);
            //Create the difference between the last save and the current save
            var dmp = new diff_match_patch();

            var diff = dmp.diff_main(previousDocument.markup || '', newDocument.markup);
            console.log("diff!");
            console.log(diff);
            //Set the current document to be the last saved document
            Session.set("document.last", newDocument);

            //Make a new revision for this document
            var revision = {};
            revision.diffs = diff;
            revision.title = $('.notebookTitle').val();
            // Server-side database transaction that saves the revision remotely to the document.
            api_saveDocument(token, revision);
        }
    } else if (!token) {
        // ERROR: Shouldn't get to this point. 
        window.location.reload();
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
        Meteor.call('api_saveDocument', token, revision, function(error, result) {
            if (error) {
                next(error);
            } else {
                next(null, result.id);
            }
        });
    } else {
        // ERROR: Shouldn't get to this point. 
        window.reload();
    }
};


startSaveIntervals = function() {
    clearSaveIntervals();
    // Local save the file every 500ms
    localSaveInterval = setInterval(function() {
        saveLocalStorage();
    }, 1000);
    // Remote save every 5s.
    remoteSaveInterval = setInterval(function() {
        saveRemoteStorage();
    }, 500);
};

clearSaveIntervals = function() {
    if (localSaveInterval) {
        clearInterval(localSaveInterval);
    }
    if (remoteSaveInterval) {
        clearInterval(remoteSaveInterval);
    }
};

IsJsonString = function(str) {
    try {
        JSON.parse(str);
    } catch (e) {
        return false;
    }
    return true;
}

needsSave = function(oldDocument, newDocument) {
    if (!oldDocument || !newDocument || (oldDocument.markup != newDocument.markup || oldDocument.title != newDocument.title)) {
        return true;
    } else {
        return false;
    }
}