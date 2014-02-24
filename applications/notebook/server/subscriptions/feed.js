Meteor.publish("feeds", function(userID) {
    return Feeds.find(
        /*{
        $or: [{
            permission: '*'
        }, {
            permission: userID
        }, {
            owner: userID
        }]
    }*/
    );
});