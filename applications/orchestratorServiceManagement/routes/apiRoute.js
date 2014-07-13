module.exports = function(servConf, dbService) {
    var returnObj = {};
    var request = require('request');

    returnObj.userInfo = function(req, res) {
        testToken(req.cookies.access_token, function(err, user) {
            if (user) {
                res.json(user);
            } else {
                var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
                res.redirect(301, req.protocol + "://" + hostname + ':3000/');
            }
        });
    };

    returnObj.logout = function(req, res) {
        res.clearCookie('access_token');
        var hostname = (req.headers.host.match(/:/g)) ? req.headers.host.slice(0, req.headers.host.indexOf(":")) : req.headers.host;
        res.redirect(301, req.protocol + "://" + hostname);
    };

    function exchangeToken(auth_code, callback) {
        var client_id = servConf.get().server.oAuthClientID;
        var client_secret = servConf.get().server.oAuthClientSecret;

        request.post('http://localhost:4455/oauth/access_token', {
            form: {
                client_id: client_id,
                client_secret: client_secret,
                code: auth_code
            }
        }, function(error, response, body) {
            if (!error && body && response.statusCode != 400) {
                callback(JSON.parse(body).access_token);
            } else {
                callback(null);
            }
        });
    }

    function testToken(auth_token, callback) {
        if (!auth_token) {
            request.get('http://localhost:4455/api/user?', function(error, response, body) {
                if (error || response.statusCode == 401) {
                    callback(null, null);
                } else {
                    callback(null, JSON.parse(body));
                }
            });
        } else {
            request.get('http://localhost:4455/api/user?access_token=' + auth_token, function(error, response, body) {
                if (error || response.statusCode == 401) {
                    callback(null, null);
                } else {
                    callback(null, JSON.parse(body));
                }
            });
        }
    }

    return returnObj;
};