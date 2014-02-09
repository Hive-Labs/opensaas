loadLocalStorage = function() {
    if (typeof(Storage) !== "undefined") {
        console.log("loading.");
        var lastDocument = localStorage.lastDocument;
        if (lastDocument && IsJsonString(lastDocument)) {
            var jsonDoc = JSON.parse(lastDocument);
            $(".notebookEditableArea").html(jsonDoc.markup);
            $('.notebookTitle').val(jsonDoc.title);
        }
    }
};

rebuildDiffs = function(revisions) {
    console.log("Rebuilding diffs");
    var diffs = [];
    for (var i = 0; i < revisions.length; i++) {
        if (revisions[i].diffs) {
            for (var j = 0; j < revisions[i].diffs.length; j++) {
                diffs.push(revisions[i].diffs[j]);
            }
        }
    }
    var dmp = new diff_match_patch();
    var patches = dmp.patch_make(diffs);
    var result = dmp.patch_apply(patches, "");
    console.log(diffs);
    console.log(result);
    return result[0];
}