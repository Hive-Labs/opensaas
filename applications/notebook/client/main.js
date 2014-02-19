currentTemplate = null;
template_changer = new Deps.Dependency();

//The inner page is dynamic. It can be set to loading page, editor page, or the login page.
Template.innerFragment.helpers({
    dynamicTemplate: function() {
        template_changer.depend();
        //If init() function hasn't set what template to load, then run init()
        if (currentTemplate == null) {
            //Check to make sure user is logged in and bring them to the right screen
            init();
            //Show the loading page as the init() function is running
            return Template.loading();
        } else {
            //If load is complete, the init() function would have set what template to load
            return currentTemplate();
        }
    }
});

/*  This function will check whether user is logged in and set currentTemplate to the appropriate
    template. If user is not logged in, currentTemplate=Template.login(). If user is logged in,
    currentTemplate=Template.editor(). 
*/

function init() {
    /*  We have an auth_code in our url. Give it to the authServer and trade it for a token.
        If code was valid, then it will set a cookie hive_auth_token and refresh the page. 
        If it isn't, bring them back to the login screen.
    */
    if (getParameterByName("code")) {
        auth_tradeCode(getParameterByName("code"), function(result) {
            if (result == true) {
                // Refresh the page
                window.location = '/';
            } else {
                //Show the login screen
                currentTemplate = loadLoginPage;
                template_changer.changed();
                setTimeout(loadLoginPage, 50);
            }
        });
    }
    /*  The page was refreshed and it seems the hive_auth_token cookie is set. Make sure it
        is valid by testing it with authServer. If it is valid, bring them to the editor screen.
        Otherwise, bring them to the login screen.
    */
    else if (getCookie("hive_auth_token")) {
        auth_testToken(function(result) {
            if (result == true) {
                auth_loadUser(function(user) {
                    //Bring the user to the binder page
                    showBinder(user);
                });
            } else {
                //Show login screen if the cookie token was bad.
                currentTemplate = Template.login;
                template_changer.changed();
                setTimeout(loadLoginPage, 50);
            }
        });
    }
    /*  There isn't a code in the url and the cookie hasn't been set. The user is clearly not logged
        in, so bring them to the login page.
    */
    else {
        //If this delay isn't there, there is some funky text on the screen. Possible bug.
        setTimeout(function() {
            currentTemplate = Template.login;
            template_changer.changed();
            setTimeout(loadLoginPage, 50);
        }, 50);
    }
}

showLoadingBox = function() {
    var loadingBox = $('#pleaseWaitDialog');
    loadingBox.modal("show");
};


hideLoadingBox = function() {
    var loadingBox = $('#pleaseWaitDialog');
    loadingBox.modal("hide");
};