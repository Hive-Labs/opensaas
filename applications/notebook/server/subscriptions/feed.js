Meteor.publish("feeds", function(token) {
    if (token) {
        var user = api_getUser(token);
        if (user) {
            var userID = user.id;
            return Feeds.find({
                $or: [{
                    permission: '*'
                }, {
                    permission: userID
                }, {
                    owner: userID
                }]
            });
        }
    }
});