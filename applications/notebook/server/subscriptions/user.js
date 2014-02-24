Meteor.publish('usersProfile', function() {
    return Users.find({

    }, {
        limit: 50,
        fields: {
            privileges: 0,
            notifications: 0
        }
    });
});