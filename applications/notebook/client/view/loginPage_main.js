/*  Set it so when the user clicks the login button, it will bring them to the authServer's login page.
    then set the callback url to be the current url.
*/
loadLoginPage = function() {
    $(document).ready(function() {
        $('#loginBtn').click(function() {
            window.location = config.authServerHost + '/dialog/authorize?response_type=code&client_id=' + config.authClientID;
        });
    });
};