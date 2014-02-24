getRequest = function(serverHost, serverPort, path, next) {
    var url = serverHost + ":" + serverPort + path;
    Meteor.http.call("GET", url, function(error, result) {
        next(error, result);
    });
};

postRequest = function(serverHost, serverPort, path, object, next) {
    var url = serverHost + ":" + serverPort + path;
    Meteor.http.call("POST", url, {
        data: object
    }, function(error, result) {
        next(error, result);
    });
};

deleteRequest = function(serverHost, serverPort, path, next) {
    var url = serverHost + ":" + serverPort + path;
    Meteor.http.call("DELETE", url, function(error, result) {
        next(error, result);
    });
};

readCookie = function(name, request) {
    //  Get a list of cookies from the request
    var cookies = request.headers.cookie.split(';');
    //  Append a '=' to the name of the cookie
    var nameEQ = name + "=";
    //  Iterate through all the cookies
    for (var i = 0; i < cookies.length; i++) {
        var c = cookies[i];
        //  Get rid of the spaces in the beginning
        while (c.charAt(0) == ' ') c = c.substring(1, c.length);
        //  Return the value part of the cookie
        if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length, c.length);
    }
    return null;
}