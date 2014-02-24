/*
    This is an asyncronous function used to submit a feed into the database.
*/
api_submitFeed = function(token, feed) {
    //  Get information about the user from the auth service
    var authServiceUser = auth_getUser(token);

    if (!feed.owner || !feed.permission || !feed.text) {
        return new ParameterError("Owner, Permission, and Text need to be set for a feed.");
    } else {
        //  This is the url we need to post to the dbService, to save that user
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.feeds;

        //  We perform the post request to save this new user to the database
        postRequest(config.dbServerHost, config.dbServerPort, url, feed, function(err, feed) {
            var error = err;
            if (!error) {
                var feedID = feed.data.id;
                delete feed.data.id;
                //  Save this user to the temporary mongoDB database.
                feed.couch_id = feedID;
                Feeds.upsert({
                    couch_id: feedID
                }, feed.data);
            } else {
                console.log("Error saving to database while creating feed.");
                console.log(error);
            }
        });
    }
    return true;
};

api_getAllFeeds = function() {
    var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.feeds;

    getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
        //  If there was no error, and result isn't null
        if (!err && result != null) {
            for (var i = 0; i < result.data.length; i++) {
                var feedID = result.data[i]._id;
                delete result.data[i].id;
                delete result.data[i]._id;
                result.data[i].couch_id = feedID;
                Feeds.upsert({
                    couch_id: feedID
                }, result.data[i]);

                result.data[i].id = feedID;
            }
            console.log(result.data.length + " feeds retrieved from db.");
        }
    });
}