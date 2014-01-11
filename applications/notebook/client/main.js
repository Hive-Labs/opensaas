var currentTemplate;
var login_dep = new Deps.Dependency();

//The inner page is dynamic. It can be set to loading page, editor page, or the login page.
Template.innerFragment.helpers({
    dynamicTemplate: function() {
        login_dep.depend();
        //If init() function hasn't set what template to load, then run init()
        if (currentTemplate == null) {
            //Check to make sure user is logged in and bring them to the right screen
            init();
            //Show the loading page as the init() function is running
            return Template.loading();
        } else {
            //If load is complete, the init() function would have set what template to load
            return currentTemplate;
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
                currentTemplate = loadLoginPage();
                login_dep.changed();
                setTimeout(loadLoginPage, 50);
            }
        });
    }
    /*  The page was refreshed and it seems the hive_auth_token cookie is set. Make sure it
        is valid by testing it with authServer. If it is valid, bring them to the editor screen.
        Otherwise, bring them to the login screen.
    */
    else if (getCookie("hive_auth_token")) {
        auth_testToken(getCookie("hive_auth_token"), function(result) {
            if (result == true) {
                auth_loadUser(getCookie("hive_auth_token"), function(result) {
                    //Bring the user to the editor page
                    currentTemplate = Template.editor();
                    login_dep.changed();
                    //Set the name at the top right to be the user's name.
                    $("#fullName").text(result.displayName);
                    //Load the contents of the editor page (like formatting bar, etc.)
                    setTimeout(loadEditorPage, 50);
                });
            } else {
                //Show login screen if the cookie token was bad.
                currentTemplate = Template.login();
                login_dep.changed();
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
            currentTemplate = Template.login();
            login_dep.changed();
            setTimeout(loadLoginPage, 50);
        }, 50);
    }
}

/*  Set it so when the user clicks the login button, it will bring them to the authServer's login page.
    then set the callback url to be the current url.
*/
function loadLoginPage() {
    $(document).ready(function() {
        $('#loginBtn').click(function() {
            window.location = config.authServerHost + '/dialog/authorize?response_type=code&client_id=' + config.authClientID;
        });
    });
};

//Load the editor page (the functional part) like the formatting bar, page size, etc.
function loadEditorPage() {
    $(document).ready(function() {
        loadFormattingBar();

        setPageSize(8.5, 11);
        //Start, End, Tick interval, number interval
        generateRuler(0, 8.5, 1 / 8, 1);
        //Left margin, Right margin 
        setMargin(1, 1);

        setSaveStatus(SAVE_STATUS.UNSAVED);
        //Load the last file from browser storage
        loadLocalStorage();
        //Save the file every 500ms
        setInterval(function() {
            saveLocalStorage();
        }, 500);

        //Hide the top bar after 1.5 seconds
        setTimeout(function() {
            hideNavBar();
        }, 1500);

        //Show the navbar when user puts mouse over
        $("#navBarMain").mouseover(function() {
            cancelHide = true;
            showNavBar();
        });

        //Wait 2 seconds before hiding when the user leaves the mouse, in case they come back.
        var cancelHide = false;
        $("#navBarMain").mouseleave(function() {
            cancelHide = false;
            setTimeout(function() {
                if (!cancelHide) {
                    hideNavBar();
                }
            }, 2000);
        });

        animateNotebookLeftToRight();
        animateSuggestionsRightToLeft();
    });
};