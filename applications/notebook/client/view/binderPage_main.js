showBinder = function(user) {
    showLoadingBox();
    loadBinderPage(function() {
        currentTemplate = Template.binder();
        template_changer.changed();
        setTimeout(renderBinderPage, 50);
        hideLoadingBox();
        if (user) {
            //Set the name at the top right to be the user's name.
            $("#fullName").text(user.displayName);
        }
    });
};

//Load the binder page (the functional part)
loadBinderPage = function(next) {
    clearSaveIntervals();
    $(document).ready(function() {
        loadDocuments(function() {
            next();
        });
    });
};

renderBinderPage = function() {

};