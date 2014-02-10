api_getAllDocuments = function(token, next) {
    Meteor.call('api_getAllDocuments', token, function(error, result) {
        if (result == null) {
            result = [];
        }
        next(null, result);
    });
};

api_getDocument = function(token, documentID, next) {
    Meteor.call('api_getDocument', token, documentID, function(error, result) {
        next(null, result);
    });
};

api_deleteDocument = function(token, documentID, next) {
    Meteor.call('api_deleteDocument', token, documentID, function(error, result) {
        next(null, result);
    });
};

api_saveDocument = function(token, revision) {
    Meteor.call('api_saveDocument', token, revision, documentID, function(error, result) {
        if (error) {
            setSaveStatus(SAVE_STATUS.FAILED);
            console.log(error);
        } else {
            console.log(result);
            setSaveStatus(SAVE_STATUS.SUCCESS);
        }
    });
};