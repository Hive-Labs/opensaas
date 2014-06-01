module.exports = function(db) {
    var returnObj = {};
    var passport = require('passport'),
        login = require('connect-ensure-login'),
        errorcodes = require("./errorcodes");


    returnObj.index = function(req, res) {
        res.end('Hello ' + req.user.displayName);
    };

    returnObj.loginForm = function(req, res) {
        res.render('login');
    };

    returnObj.usersForm = function(req, res) {
        res.render('users', {
            users: db.users.users
        });
    };

    returnObj.removeUser = function(req, res) {
        var email = req.body.email;

        if (checkIfNullOrEmpty(email)) {
            res.send(errorcodes.BAD_REQUEST("email is null."), 400);
        } else {
            db.users.removeUser(email, function(err, user) {
                if (!err) {
                    res.json(user);
                    res.statusCode = 200;
                } else {
                    logger.error("Error: " + JSON.stringify(err));
                    res.send(err, 401);
                    res.end();
                }
            });
        }

    };

    returnObj.newUser = function(req, res) {
        var name = req.body.name,
            email = req.body.email,
            password = req.body.password;
        logger.info("Get newUser data: name=" + name + " email=" + email + " password=" + password);
        if (checkIfNullOrEmpty(name) || checkIfNullOrEmpty(email) || checkIfNullOrEmpty(password)) {
            res.send(errorcodes.BAD_REQUEST("name, email, or password is null. name=" + name + " email=" + email + " password=" + password), 400);
        } else {
            db.users.addUser(name, email, password, function(err, user) {
                logger.info("site.newUser callback.");
                if (!err) {
                    res.json(user);
                    res.statusCode = 200;
                } else {
                    logger.error("Error: " + JSON.stringify(err));
                    res.send(err, 401);
                    res.end();
                }
            });
        }

    };

    returnObj.login = passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login'
    });


    returnObj.googleAuth = passport.authenticate('google', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login'
    });

    returnObj.logout = function(req, res) {
        req.logout();
        if (req.query.redirectUri) {
            console.log("redirecting to: " + req.query.redirectUri);
            res.redirect(req.query.redirectUri);
        } else {
            res.redirect("/");
        }
    };

    returnObj.account = [

        function(req, res) {
            res.render('account', {
                user: req.user
            });
        }
    ];

    function checkIfNullOrEmpty(object) {
        if (object == null || object == "") {
            return true;
        } else {
            return false;
        }
    }
    return returnObj;
}