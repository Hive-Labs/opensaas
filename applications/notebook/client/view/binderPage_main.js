/*
    This function will show the binder page. It will first load the 
    functional part, and then it will load the UI.
*/
showBinder = function(user) {
    //  Show the loading box while we load stuff
    showLoadingBox();
    //  load the functional part of the binder page
    loadBinderPage(function() {
        //  load the UI part of the binder page
        renderBinderPage();
        currentTemplate = Template.binder();
        template_changer.changed();
        //  hide the loading box because its all loaded
        hideLoadingBox();
        if (user) {
            //Set the name at the top right to be the user's name.
            $("#fullName").text(user.displayName);
        }
    });
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

//  Load the binder page (the UI part)
renderBinderPage = function() {

};