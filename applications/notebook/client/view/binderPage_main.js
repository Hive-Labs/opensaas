binderRefreshInterval = 0;
binderCurrentlyRefreshing = false;

/*
    This function will show the binder page. It will first ad the 
    functional part, and then it will load the UI.
*/
showBinder = function(user, tabToShow) {
    //  Show the loading box while we load stuff
    showLoadingBox();
    //  load the UI part of the binder page
    Session.set('currentView', "binder");
    currentTemplate = Template.binder;
    template_changer.changed();
    setTimeout(function() {
        renderBinderPage(tabToShow);
    }, 50);
    //  hide the loading box because its all loaded
    hideLoadingBox();
    if (user) {
        //Set the name at the top right to be the user's name.
        $("#fullName").text(user.displayName);
    }
};

//  Load the binder page (the functional part)
loadBinderPage = function(next) {
    clearSaveIntervals();
    $(document).ready(function() {
        loadDocuments(function() {
            next();
        });
    });
};

loadFeeds = function() {
    var topFeeds = Feeds.find({}, {
        limit: 10
    });

}

//  Load the binder page (the UI part)
renderBinderPage = function(tabToShow) {

    Meteor.subscribe('feeds', getCookie("hive_auth_token"));
    Meteor.subscribe('usersProfile');
    Meteor.subscribe('documents', getCookie("hive_auth_token"));

    Session.set('currentPage', 1);

    loadFeeds();
    // run the above func every time the user scrolls

    var user = Session.get("user.current");
    if (user.onBoarded == true) {
        $(".onBoardingDiv").css("display", "none");
    } else {
        $('.profilePictureImage').css("display", "none");
        $(".newsFeedDiv").css("display", "none");
    }

    if (tabToShow) {
        $('#binderTabs a[href="#' + tabToShow + '"]').tab('show') // Select tab by name
    }
};

upVoteFeed = function(couch_id) {
    api_upvoteFeed(couch_id, function() {

    });
};

downVoteFeed = function(couch_id) {
    api_downvoteFeed(couch_id, function() {

    });
};