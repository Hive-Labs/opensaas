/*
    This will get the last edited document from the local storage
    and return that.
*/
loadLocalStorage = function() {
    //  Make sure user has local storage enabled.
    if (typeof(Storage) !== "undefined") {
        //  localStorage.lastDocument is the last saved document on the user's browser
        var lastDocument = localStorage.lastDocument;
        //  Check to make sure the lastDocument's id matches the current document's id.
        if (lastDocument && IsJsonString(lastDocument) && lastDocument.id == Session.get('document.currentID')) {
            var jsonDoc = JSON.parse(lastDocument);
            console.log("Found a local copy of the document.");
            console.log(jsonDoc);
            return jsonDoc;
        } else {
            //  We have the wrong document, so ignore it.
            return null;
        }
    } else {
        return null;
    }
};

/*
    Given a list of "revisions" and the number of revisions to go up to,
    it will compile all the revisions from 0 to numberOfRevisions and
    return a string markup of the document.
*/
rebuildDiffs = function(revisions, numberOfRevisions) {
    //  User is trying to compile more revisions than the total number of revisions.
    if (numberOfRevisions > revisions.length) {
        //  Just return an empty markup
        return "";
    } else {
        var finalMarkup = "";
        // If the number of revisions is not specified, do all the revisions
        numberOfRevisions = numberOfRevisions || revisions.length;
        // Iterate through all the revisions and patch up the diffs
        for (var i = 0; i < numberOfRevisions; i++) {
            // Check to make sure this revision has diffs
            if (revisions[i].diffs) {
                //  Make a patch of the revision's diffs and patch up finalMarkup with it
                var dmp = new diff_match_patch();
                var patches = dmp.patch_make(revisions[i].diffs);
                finalMarkup = dmp.patch_apply(patches, finalMarkup)[0];
            }
        }
        return finalMarkup;
    }
}