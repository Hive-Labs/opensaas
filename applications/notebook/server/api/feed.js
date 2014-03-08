/*
    This is an asyncronous function used to submit a feed into the database.
*/
api_submitFeed = function(token, feed) {
    //  Get information about the user from the auth service
    var authServiceUser = auth_getUser(token);

    if (!feed.owner || !feed.permission || !feed.text) {
        return new ParameterError("Owner, Permission, and Text need to be set for a feed.");
    } else {
        feed.votes = 0;
        feed.submitDate = new Date();
        feed.upvotes = [];
        feed.downvotes = [];
        api_saveFeed(feed);
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

                var upgradeNecessary = false;

                if (!result.data[i].upvotes) {
                    result.data[i].upvotes = [];
                    upgradeNecessary = true;
                    console.log("DB Upgrade: Added upvotes field to feed.");
                    lo
                }
                if (!result.data[i].downvotes) {
                    result.data[i].downvotes = [];
                    upgradeNecessary = true;
                    console.log("DB Upgrade: Added upvotes field to feed.");
                }

                result.data[i].id = feedID;

                api_saveFeed(result.data[i]);
            }
            console.log(result.data.length + " feeds retrieved from db.");
        }
    });
}

api_getFeed = function(couch_id) {
    var feed = Feeds.findOne({
        couch_id: couch_id
    });

    if (feed != null) {
        return feed;
    } else {
        var fut = new Future();
        var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.feeds + "/" + couch_id;
        getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
            //  If there was no error, and result isn't null
            if (!err && result != null) {
                var feedID = result.data._id;
                delete result.data.id;
                delete result.data._id;
                result.data.couch_id = feedID;
                Feeds.upsert({
                    couch_id: feedID
                }, result.data);
                delete result.data.couch_id;
                result.data.id = feedID;
                fut['return'](result.data);
            } else {
                fut['return'](err);
            }
        });
        return fut.wait();
    }
}

api_saveFeed = function(feed) {
    var url;
    if (!feed.id && !feed._id) {
        url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.feeds;
    } else {
        url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.feeds + "/" + (feed.couch_id || feed.id || feed._id);
    }
    console.log("Saving feed: " + JSON.stringify(feed));
    feed.votes = feed.upvotes.length - feed.downvotes.length;
    //  We perform the post request to save this new user to the database
    postRequest(config.dbServerHost, config.dbServerPort, url, feed, function(err, feed) {
        var error = err;
        if (!error) {
            var feedID = feed.data.id || feed.data._id;
            delete feed.data.id;
            delete feed.data._id;
            //  Save this user to the temporary mongoDB database.
            feed.couch_id = feedID;
            Feeds.upsert({
                couch_id: feedID
            }, feed.data);
        } else {
            console.log("Error saving to database while saving feed.");
            console.log(error);
        }
    });
}

api_upvoteFeed = function(token, couch_id) {
    var feed = api_getFeed(couch_id);
    var user = api_getUser(token);

    var userAlreadyVoted = false;
    for (var i = 0; i < feed.upvotes.length; i++) {
        if (feed.upvotes[i] == user.id) {
            userAlreadyVoted = true;
        }
    }

    for (var i = 0; i < feed.downvotes.length; i++) {
        if (feed.downvotes[i] == user.id) {
            userAlreadyVoted = true;
        }
    }

    if (!userAlreadyVoted) {
        feed.votes++;
        feed.upvotes.push(user.id);
        api_saveFeed(feed);
    }
};

api_downvoteFeed = function(token, couch_id) {
    var feed = api_getFeed(couch_id);
    var user = api_getUser(token);

    var userAlreadyVoted = false;
    for (var i = 0; i < feed.downvotes.length; i++) {
        if (feed.downvotes[i] == user.id) {
            userAlreadyVoted = true;
        }
    }

    for (var i = 0; i < feed.upvotes.length; i++) {
        if (feed.upvotes[i] == user.id) {
            userAlreadyVoted = true;
        }
    }

    if (!userAlreadyVoted) {
        feed.votes--;
        feed.downvotes.push(user.id);
        api_saveFeed(feed);
    }
};