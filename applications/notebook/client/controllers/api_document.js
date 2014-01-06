api_getAllDocuments = function(token, next) {
    Meteor.call('api_getAllDocuments', token, function(error, result) {
        console.log(error);
        console.log(result);
        next(null, result);
    });
};