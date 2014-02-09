api_getAllDocuments = function(token, next) {
    Meteor.call('api_getAllDocuments', token, function(error, result) {
        console.log("get all documents.");
        if (result == null) {
            result = [];
        }
        console.log(result);
        next(null, result);
    });
};

api_getDocument = function(token, documentID, next) {
    Meteor.call('api_getDocument', token, documentID, function(error, result) {
        console.log(result);
        next(null, result);
    });
};