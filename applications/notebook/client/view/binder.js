Template.documents.documents = function() {
    return Session.get("document.list");
};

loadDocuments = function(next) {
    token = getCookie("hive_auth_token");
    api_getAllDocuments(token, function(err, documents) {
        console.log(documents);
        for (var i = 0; i < documents.length; i++) {
            var document = documents[i];
            var months = ["January", "February", "March", "April", "May", "June",
                "July", "August", "September", "October", "November", "December"
            ];
            var date = (new Date(document.creationTime));
            var year = date.getFullYear(),
                month = months[date.getMonth()],
                day = date.getDate();

            if (day < 10) day = "0" + day;

            var properlyFormatted = day + " " + month + " " + year;
            var lastRevision = document.revisions[document.revisions.length - 1];
            if (lastRevision) {
                document.title = lastRevision.title || "Untitled";
            } else {
                document.title = "Untitled";
            }
            document.creationTime = properlyFormatted;
            documents[i] = document;
            console.log(document);

        }
        console.log("Total documents: " + documents.length);
        Session.set("document.list", documents);
        next();
    });
};

loadDocument = function(documentID) {
    Session.set('document.currentID', documentID);
    loadEditorPage(function(error, document) {
        currentTemplate = Template.editor();
        template_changer.changed();
        setTimeout(function() {
            renderEditorPage(document);
        }, 50);
    });
};