var currentTemplate;
var login_dep = new Deps.Dependency();

Template.innerFragment.helpers({
    dynamicTemplate: function() {
        login_dep.depend();
        if (currentTemplate == null) {
            init();
            return Template.loading();
        } else {
            return currentTemplate;
        }
    }
});

function init() {
    if (getParameterByName("code")) {
        auth_tradeCode(getParameterByName("code"), function(result) {
            if (result == true) {
                window.location = '/';
            } else {
                currentTemplate = loadLoginPage();
                login_dep.changed();
                setTimeout(loadLoginPage, 50);
            }
        });
    } else if (getCookie("hive_auth_token")) {
        auth_testToken(getCookie("hive_auth_token"), function(result) {
            if (result == true) {
                auth_loadUser(getCookie("hive_auth_token"), function(result) {
                    currentTemplate = Template.editor();
                    login_dep.changed();
                    $("#fullName").text(result.displayName);
                    setTimeout(loadEditorPage, 50);
                });
            } else {
                currentTemplate = Template.login();
                login_dep.changed();
                setTimeout(loadLoginPage, 50);
            }
        });
    } else {
        //If this delay isn't there, there is some funky text on the screen
        setTimeout(function() {
            currentTemplate = Template.login();
            login_dep.changed();
            setTimeout(loadLoginPage, 50);
        }, 50);
    }
}


function loadLoginPage() {
    $(document).ready(function() {
        $('#loginBtn').click(function() {
            window.location = config.authServerHost + '/dialog/authorize?response_type=code&client_id=' + config.authClientID;
        });
    });
};

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
            //saveRemoteStorage();
        }, 500);

        api_getAllDocuments(getCookie("hive_auth_token"), function(err, result) {
            console.log(err);
            console.log(result);
        });

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