Meteor.publish('document', function(documentID) {
    return Documents.find({
        couch_id: documentID
    });
});