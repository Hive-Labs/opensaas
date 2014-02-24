/*
    We modified the default meteor main.js to include futures
    for asyncronous code calls.
*/
Meteor.startup(function() {
    Future = Npm.require('fibers/future');
    var fs = Npm.require('fs');

    Users.remove({});
    Documents.remove({});
    Feeds.remove({});
    //  Check to see if the profile picture directory exists
    var directoryPath = Npm.require('path').resolve('.', config.temporaryPaths.profilePicture);
    if (!fs.existsSync(directoryPath)) {
        fs.mkdirSync(directoryPath, 0755);
    }

    api_getAllFeeds();
});