api_upvoteFeed = function(couch_id, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_upvoteFeed', token, couch_id, function(error, result) {
        next(result);
    });
};

api_downvoteFeed = function(couch_id, next) {
    var token = getCookie("hive_auth_token");
    Meteor.call('api_downvoteFeed', token, couch_id, function(error, result) {
        next(result);
    });
};