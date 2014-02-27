Meteor.methods({
    api_submitFeed: function(token, feed) {
        return api_submitFeed(token, feed);
    },
    api_upvoteFeed: function(token, couch_id) {
        return api_upvoteFeed(token, couch_id);
    },
    api_downvoteFeed: function(token, couch_id) {
        return api_downvoteFeed(token, couch_id);
    }
});