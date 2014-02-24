binderRefreshInterval = 0;
binderCurrentlyRefreshing = false;

/*
    This function will show the binder page. It will first load the 
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
    //  Start refreshing the data in page occasionally
    setRefreshInterval();
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
    Meteor.subscribe('feeds', Session.get("user.current").id);
    Meteor.subscribe('usersProfile');

    loadFeeds();

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

setRefreshInterval = function() {
    binderRefreshInterval = window.setInterval(function() {
        if (binderCurrentlyRefreshing == false && currentTemplate == Template.binder) {
            binderCurrentlyRefreshing = true;
            var oldDocuments = Template.documents.documents();
            loadDocuments(function() {
                var newDocuments = Template.documents.documents();
                var equal = true;
                for (var i = 0; i < newDocuments.length; i++) {
                    if (oldDocuments && oldDocuments[i]) {
                        equal = equal && (newDocuments[i].title == oldDocuments[i].title);
                    } else if (!oldDocuments) {
                        equal = false;
                    }
                }
                if (!equal) {
                    $("#docs").html(Template.documents);
                }
                binderCurrentlyRefreshing = false;
            });
        }
    }, 2000);
};

clearRefreshInterval = function() {
    window.clearInterval(binderRefreshInterval);
    binderRefreshInterval = null;
    binderCurrentlyRefreshing = false;
};