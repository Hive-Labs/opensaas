module.exports = function(dbService, logger) {
    var returnObj = {};

    var crypto = require('crypto');

    returnObj.users = [];

    var ERROR_CODE = {
        USER_EXISTS: 'The given email already exists.',
        USER_DOESNT_EXIST: 'The given email does not exist.'
    };

    returnObj.init = function(next) {
        logger.info("db.users.init()");
        dbService.get("credentials", "user", function(err, users) {
            if (err) {
                if (err.error == 'not_found') {
                    logger.info("There are no users in the database yet. Adding default admin user.");
                    returnObj.addUser("Administrator", "admin", "admin", null, function(err, user) {
                        if (err) {
                            logger.error("db.users.init() error:" + err);
                        } else {
                            next();
                        }
                    });
                } else {
                    logger.error(err);
                }
            } else {
                returnObj.users = users;
                logger.info("Users loaded. Users=" + JSON.stringify(users));
                next();
            }
        });
    };

    returnObj.find = function(id, done) {
        for (var i = 0, len = returnObj.users.length; i < len; i++) {
            var user = returnObj.users[i];
            if (user._id === id) {
                return done(null, user);
            }
        }
        return done(null, null);
    };

    returnObj.findByEmail = function(email, done) {
        for (var i = 0, len = returnObj.users.length; i < len; i++) {
            var user = returnObj.users[i];
            if (user.email === email) {
                return done(null, user);
            }
        }
        return done(null, null);
    };

    returnObj.addUser = function(name, email, password, type, done) {
        logger.info("db.users.addUser()");
        returnObj.findByEmail(email, function(err, user) {
            if (user != null || err != null) {
                logger.error("User already exists.");
                done(ERROR_CODE.USER_EXISTS, null);
            } else {
                var pass = null;
                if (!type) {
                    var shasum = crypto.createHash('sha1');
                    shasum.update(password);
                    pass = shasum.digest('hex');
                }
                var newUser = {
                    email: email,
                    password: pass,
                    displayName: name,
                    type: type
                };

                dbService.set("credentials", "user", newUser, function(err, obj) {
                    if (!err) {
                        newUser._id = "pending";
                        returnObj.users.push(newUser);
                        returnObj.init(function() {});
                    }
                    done(err, obj);
                });
            }
        });
    };

    returnObj.removeUser = function(email, done) {
        logger.info("db.users.removeUser()");
        returnObj.findByEmail(email, function(err, user) {
            if (user == null || err != null) {
                logger.error("User does not exist.");
                done(ERROR_CODE.USER_DOESNT_EXIST, null);
            } else {
                dbService.remove("credentials", "user", user._id, function(err, obj) {
                    if (!err) {
                        returnObj.init(function() {});
                    }
                    done(err, obj);
                });
            }
        });
    };

    returnObj.updateUser = function(user, displayName, email, password, done) {
        logger.info("db.users.updateUser()");
        user.displayName = displayName;
        user.password = password;
        user.email = email;
        delete user._rev;
        dbService.setID("credentials", "user", user._id, user, function(err, obj) {
            if (!err) {
                returnObj.init(function() {});
            }
            done(err, obj);
        });
    };

    return returnObj;
}