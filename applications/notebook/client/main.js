var currentTemplate;
var login_dep = new Deps.Dependency();

Template.innerFragment.helpers({
    dynamicTemplate: function() {
        login_dep.depend();
        if(currentTemplate == null){
            init();
            return Template.login();
        }else{

            return currentTemplate;    
        }
        
    }
});

function init(){
    if (getParameterByName("code")) {
        auth_tradeCode(getParameterByName("code"), function(result) {
            if (result == true) {
                window.location = '/';
            } else {
                console.log("LOGIN2!");
                currentTemplate = loadLoginPage();
                login_dep.changed();
                setTimeout(loadLoginPage, 2000);
            }
        });
    } else if (getCookie("hive_auth_token")) {
        auth_testToken(getCookie("hive_auth_token"), function(result) {
            if (result == true) {
                currentTemplate = Template.editor();
                login_dep.changed();
                setTimeout(loadEditorPage, 50);
            } else {
                currentTemplate = Template.login();
                login_dep.changed();
                setTimeout(loadLoginPage, 500);
            }
        });
    } else {
        currentTemplate = Template.login();
        login_dep.changed();
        setTimeout(loadLoginPage, 500);
    }
}
    

function loadLoginPage() {
    $(document).ready(function() {
        $('#loginBtn').click(function() {
            window.location = config.authServerHost + '/dialog/authorize?response_type=code&client_id=' + config.authClientID;
        });
    });
    return Template.login();
};

function loadEditorPage() {
    $(document).ready(function() {
        $('.notebook').css({
            "left": '-2000px'
        });
        $('.suggestions').css({
            "right": '-2000px'
        });

        setTimeout(function() {
            $('.notebook').animate({
                "left": '+=2000'
            }, {
                duration: 750
            });

            $('.suggestions').animate({
                "right": '+=2000'
            }, {
                duration: 750
            });

        }, 500);

        $('#fontSelect').fontSelector({
            'hide_fallbacks': true,
            'initial': 'Courier New,Courier New,Courier,monospace',
            'selected': function(style) {

            },
            'fonts': [
                'Arial,Arial,Helvetica,sans-serif',
                'Arial Black,Arial Black,Gadget,sans-serif',
                'Comic Sans MS,Comic Sans MS,cursive',
                'Courier New,Courier New,Courier,monospace',
                'Georgia,Georgia,serif',
                'Impact,Charcoal,sans-serif',
                'Lucida Console,Monaco,monospace',
                'Lucida Sans Unicode,Lucida Grande,sans-serif',
                'Palatino Linotype,Book Antiqua,Palatino,serif',
                'Tahoma,Geneva,sans-serif',
                'Times New Roman,Times,serif',
                'Trebuchet MS,Helvetica,sans-serif',
                'Verdana,Geneva,sans-serif',
                'Gill Sans,Geneva,sans-serif'
            ]
        });

        setPageSize(8.5, 11);
        generateRuler(0, 8.5, 1 / 8, 1);
        setMargin(1, 1, true);
        setSaveStatus(SAVE_STATUS.UNSAVED);
        loadLocalStorage();

        setInterval(function() {
            saveLocalStorage();
        }, 500);

        setTimeout(function() {
            hideNavBar();
        }, 1500);

        $("nav").mouseleave(function() {
            hideNavBar();
        });

        $("nav").mouseover(function() {
            showNavBar();
        });
    });
};