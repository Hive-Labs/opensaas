deleteDocument = function(documentID) {
    var token = getCookie("hive_auth_token");
    api_getDocument(token, documentID, function(error, document) {
        BootstrapDialog.show({
            message: 'You are about to delete document: ' + document.title + ". Click away to cancel.",
            buttons: [{
                label: 'Delete',
                cssClass: 'btn-warning',
                action: function(dialog) {
                    dialog.close();
                    api_deleteDocument(token, documentID, function() {
                        showBinder(null);
                    });
                }
            }]
        });
    });
};