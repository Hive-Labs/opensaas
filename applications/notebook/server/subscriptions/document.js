Meteor.publish('document', function(documentID) {
    return Documents.find({
        _id: documentID
    });
});