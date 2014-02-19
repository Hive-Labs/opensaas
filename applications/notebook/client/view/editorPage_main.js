//  Load the editor page (the functional part) like the last saved document, etc.
loadEditorPage = function(next) {
    var documentID = Session.get('document.currentID')
    if (!documentID) {
        //There is no document loaded, so make a new one.
        console.log("Creating a new document.");
        createNewDocument(function(error, documentID) {
            //Return the id of the new document, and save it for future use in the session.
            Session.set('document.currentID', documentID);
            api_getDocument(documentID, function(error2, document) {
                next(error2, document);
            });
        });
    } else {
        //A document is already loaded up, so return the id to that document.
        console.log("Loading document: " + documentID);
        var localStorageDocument = loadLocalStorage();
        if (localStorageDocument) {
            //Ask the user whether they want to load the local copy or the last saved remotely
            BootstrapDialog.show({
                message: 'You have a local copy of the document as well as a remotely saved version. Which one would you like to open?',
                buttons: [{
                    label: 'Local Copy',
                    action: function() {
                        next(null, localStorageDocument);
                    }
                }, {
                    label: 'Remote Copy',
                    cssClass: 'btn-primary',
                    action: function() {
                        api_getDocument(documentID, function(error, document) {
                            var markup = rebuildDiffs(document.revisions);
                            document.markup = markup;
                            Session.set("document.last", document);
                            next(error, document);
                        });
                    }
                }]
            });
        } else {
            api_getDocument(documentID, function(error, document) {
                var markup = rebuildDiffs(document.revisions);
                document.markup = markup;
                Session.set("document.last", document);
                next(error, document);
            });
        }
    }
};

//  Load the editor page (the visual part) like the formatting bar, page size, etc.
renderEditorPage = function(document) {
    $(document).ready(function() {
        loadFormattingBar();

        setPageSize(8.5, 11);
        // Start, End, Tick interval, number interval
        generateRuler(0, 8.5, 1 / 8, 1);
        // Left margin, Right margin 
        setMargin(1, 1, null, true);

        setSaveStatus(SAVE_STATUS.UNSAVED);

        //Wait 2 seconds before hiding when the user leaves the mouse, in case they come back.
        var cancelHide = false;
        $("#navBarMain").mouseleave(function() {
            cancelHide = false;
            setTimeout(function() {
                if (!cancelHide) {
                    hideNavBar();
                }
            }, 10000);
        });


        //Show the navbar when user puts mouse over
        $("#navBarMain").mouseover(function() {
            cancelHide = true;
            showNavBar();
        });

        if (document.currentlyWritingUsers.length > 0) {
            $(".friendsHeader").text("Editors (" + document.currentlyWritingUsers.length + ")");
        }

        loadFriends(document);


        if (document) {
            $('.notebookTitle').val(document.title);
            $(".notebookEditableArea").html(document.markup);
        } else {
            $('.notebookTitle').val("");
            $(".notebookEditableArea").html("");
        }

        startSaveIntervals();

        animateNotebookLeftToRight();
        animateSuggestionsRightToLeft();
    });
};

showEditor = function(user, forceNew) {
    showLoadingBox();
    Session.set('currentView', "editor");
    console.log("Current View has been set to: " + Session.get("currentView"));
    clearRefreshInterval();
    if (forceNew == true) {
        Session.set('document.currentID', null);
    }

    loadEditorPage(function(error, result) {
        currentTemplate = Template.editor;
        template_changer.changed();
        //  We need this delay because the app needs some time to render
        setTimeout(function() {
            renderEditorPage(result);
        }, 50)

        if (user) {
            //Set the name at the top right to be the user's name.
            $("#fullName").text(user.displayName);
        }
        hideLoadingBox();
    });
}