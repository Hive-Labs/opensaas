//Load the editor page (the functional part) like the last saved document, etc.
loadEditorPage = function(next) {
    var documentID = Session.get('document.currentID')
    if (!documentID) {
        //There is no document loaded, so make a new one.
        createNewDocument(function(error, documentID) {
            //Return the id of the new document, and save it for future use in the session.
            Session.set('document.currentID', documentID);
            api_getDocument(token, documentID, function(error2, document) {
                next(error2, document);
            });
        });
    } else {
        //A document is already loaded up, so return the id to that document.
        token = getCookie("hive_auth_token");
        api_getDocument(token, documentID, function(error, document) {
            next(error, document);
        });
    }
};

//Load the editor page (the visual part) like the formatting bar, page size, etc.
renderEditorPage = function(document) {
    $(document).ready(function() {
        loadFormattingBar();

        setPageSize(8.5, 11);
        // Start, End, Tick interval, number interval
        generateRuler(0, 8.5, 1 / 8, 1);
        // Left margin, Right margin 
        setMargin(1, 1);

        setSaveStatus(SAVE_STATUS.UNSAVED);

        // Hide the top bar after 1.5 seconds
        setTimeout(function() {
            hideNavBar();
        }, 1500);

        //Show the navbar when user puts mouse over
        $("#navBarMain").mouseover(function() {
            cancelHide = true;
            showNavBar();
        });

        //Wait 2 seconds before hiding when the user leaves the mouse, in case they come back.
        var cancelHide = false;
        $("#navBarMain").mouseleave(function() {
            cancelHide = false;
            setTimeout(function() {
                if (!cancelHide) {
                    hideNavBar();
                }
            }, 2000);
        });

        if (document) {
            var markup = rebuildDiffs(document.revisions);
            $('.notebookTitle').val(document.title);
            $(".notebookEditableArea").html(markup);
        }
        loadLocalStorage();

        startSaveIntervals();

        animateNotebookLeftToRight();
        animateSuggestionsRightToLeft();
    });
};

showEditor = function(user, forceNew) {
    if (forceNew) {
        Session.set('document.currentID', null);
    }

    loadEditorPage(function() {
        currentTemplate = Template.editor();
        template_changer.changed();
        setTimeout(renderEditorPage, 50);
        if (user) {
            //Set the name at the top right to be the user's name.
            $("#fullName").text(user.displayName);
        }
    });
}