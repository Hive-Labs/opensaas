loadFriends = function(document) {
    var activeUsers = [];
    for (var j = 0; j < document.writeAccessUsers.length; j++) {
        api_getUserByID(token, document.writeAccessUsers[j], function(error, result) {
            if (document.currentlyWritingUsers.indexOf(result._id) > -1) {
                result.color = "#159725";
            } else {
                result.color = "#3A3D3A";
            }
            activeUsers.push(result);
            Template.friends.friends = activeUsers;
            $("#friendsInnerPanel").html(Template.friends());
        });
    }
}