loadLocalStorage = function() {
    if (typeof(Storage) !== "undefined") {
        var lastDocument = localStorage.lastDocument;
        if (lastDocument && IsJsonString(lastDocument) && lastDocument.id == Session.get('document.currentID')) {
            var jsonDoc = JSON.parse(lastDocument);
            console.log("found a local document.");
            console.log(jsonDoc);
            return jsonDoc;
        } else {
            return null;
        }
    } else {
        return null;
    }
};

rebuildDiffs = function(revisions, numberOfRevisions) {
    console.log("Rebuilding diffs");
    var diffs = [];
    for (var i = 0; i < (numberOfRevisions || revisions.length); i++) {
        if (revisions[i].diffs) {
            for (var j = 0; j < revisions[i].diffs.length; j++) {
                if (revisions[i].diffs[j][0] != 0) {
                    diffs.push(revisions[i].diffs[j]);
                }
            }
        }
    }
    var dmp = new diff_match_patch();
    var patches = dmp.patch_make(diffs);
    var result = dmp.patch_apply(patches, "");
    console.log(revisions);
    console.log(diffs);
    console.log(result);
    return result[0];
}