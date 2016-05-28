module.exports = function(db) {
    var returnObj = {};
    var passport = require('passport'),
        login = require('connect-ensure-login'),
        errorcodes = require("./errorcodes");
    returnObj.index = function(req, res) {
        if(res.session && res.session.returnTo){
            res.redirect(req.session.returnTo);    
            delete req.session.returnTo;
        } else {
            res.end('Hello ' + req.user.displayName);
        }
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
            db.users.addUser(name, email, password, null, function(err, user) {
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
        failureRedirect: '/login?loginFailed=true'
    });
    returnObj.googleAuth = passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login', , 'https://www.googleapis.com/auth/plus.profile.emails.read']
    });
    returnObj.login = passport.authenticate('local', {
        successReturnToOrRedirect: '/',
        failureRedirect: '/login?loginFailed=true'
    });
    returnObj.googleAuth = passport.authenticate('google', {
        scope: ['https://www.googleapis.com/auth/plus.login', , 'https://www.googleapis.com/auth/plus.profile.emails.read']
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
    returnObj.updateUser = function(req, res) {
        var user = req.user,
            name = req.body.name,
            email = req.body.email,
            password = req.body.password;
            var crypto = require('crypto');

            var shasum = crypto.createHash('sha1');
            shasum.update(password);
            password = shasum.digest('hex');

        logger.info("Put updateUser data: name=" + name + " email=" + email + " password=" + password);
        if (checkIfNullOrEmpty(name) || checkIfNullOrEmpty(email) || checkIfNullOrEmpty(password)) {
            res.send(errorcodes.BAD_REQUEST("name, email, or password is null. name=" + name + " email=" + email + " password=" + password), 400);
        } else {
            db.users.updateUser(user, name, email, password, function(err, user) {
                logger.info("site.updateUser callback.");
                if (!err) {
                    delete user.password;
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
    return returnObj;
}