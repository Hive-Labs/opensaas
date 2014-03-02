Meteor.publish('documents', function(token) {
    if (token) {
        var user = api_getUser(token);
        if (user) {
            var userID = user.id;
            return Documents.find({
                $or: [{
                    writeAccessUsers: userID
                }, {
                    readAccessUsers: userID
                }, {
                    authorID: userID
                }]
            });
        }
    }
});