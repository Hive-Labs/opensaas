showHistory = function(documentID) {
    showLoadingBox();
    loadHistoryPage(documentID, function(error, document) {
        currentTemplate = Template.history();
        template_changer.changed();
        setTimeout(function() {
            var markup = rebuildDiffs(document.revisions);
            document.markup = markup;
            renderHistoryPage(document)
        }, 50);
        hideLoadingBox();
    });
};

//Load the history page (the functional part)
loadHistoryPage = function(documentID, next) {
    clearSaveIntervals();
    var token = getCookie("hive_auth_token");
    api_getDocument(token, documentID, function(error, document) {
        next(error, document);
    });
};

renderHistoryPage = function(document) {
    $(document).ready(function() {
        $('#timeSlider').slider({
            min: 1,
            max: 100,
            formater: function(value) {
                var markup = rebuildDiffs(document.revisions, Math.round((value / 100) * document.revisions.length));
                $(".notebookEditableArea").html(markup);
                return 'Current value: ' + value;
            }
        });

        setPageSize(8.5, 11);
        // Start, End, Tick interval, number interval
        generateRuler(0, 8.5, 1 / 8, 1);
        // Left margin, Right margin 
        setMargin(1, 1, null, false);

        if (document) {
            console.log("DOCUMENT is:");
            console.log(document);
            $('#historyDocumentTitle').html(document.title);
            $(".notebookEditableArea").html(document.markup);
        } else {
            $('#historyDocumentTitle').html("");
            $(".notebookEditableArea").html("");
        }
    });
};