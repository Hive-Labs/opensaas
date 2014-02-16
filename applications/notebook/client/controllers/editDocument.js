/*
    Given a document id, it will in warn the user that the document
    is going to be deleted.
*/
deleteDocument = function(documentID) {
    //  First it downloads the document, so we can get the title
    api_getDocument(token, documentID, function(error, document) {
        BootstrapDialog.show({
            message: 'You are about to delete document: ' + document.title + ". Click away to cancel.",
            buttons: [{
                label: 'Delete',
                cssClass: 'btn-warning',
                action: function(dialog) {
                    dialog.close();
                    //  When the user presses the delete button, it will do the delete api call.
                    api_deleteDocument(token, documentID, function() {
                        //  When the call is done, it will show the binder page.
                        showBinder(null);
                    });
                }
            }]
        });
    });
};

/*
    Given a document id, and a user id, it will hide the user-list dialog
    and then do the api_share call.
*/
shareDocument = function(documentID, userID) {
    //  Hide the user-list dialog
    $(".modal").modal("hide");
    //  Do the api call to share a document with another userID
    api_shareDocument(token, documentID, userID, function(error, document) {
        BootstrapDialog.show({
            message: 'We will fly this document over to them asap. Thanks for sharing!'
        });
    });
}