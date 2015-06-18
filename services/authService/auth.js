module.exports = function(dbService, providers, db) {
    /**
     * Module dependencies.
     */
    var passport = require('passport'),
        LocalStrategy = require('passport-local').Strategy,
        BasicStrategy = require('passport-http').BasicStrategy,
        ClientPasswordStrategy = require('passport-oauth2-client-password').Strategy,
        GoogleStrategy = require('passport-google-oauth2').Strategy,
        configuration = require('./config.json'),
        BearerStrategy = require('passport-http-bearer').Strategy,
        crypto = require('crypto');


    /**
     * LocalStrategy
     *
     * This strategy is used to authenticate users based on a username and password.
     * Anytime a request is made to authorize an application, we must ensure that
     * a user is logged in before asking them to approve the request.
     */
    passport.use(new LocalStrategy(
        function(username, password, done) {
            db.users.findByEmail(username, function(err, user) {
                if (err) {
                    return done(err);
                }
                if (!user || user.type != null) {
                    checkAllProviders = function(idx, callback) {
                        console.log(idx);
                        if (idx >= providers.length) {
                            callback(null, false);
                        } else {
                            providers[idx].authenticate(username, password, function(err, result) {
                                if (err || !result) {
                                    checkAllProviders(idx + 1, callback);
                                } else {
                                    if (!user) {
                                        console.log("ADDING");
                                        console.log(result);
                                        db.users.addUser(result.displayName, result.email, null, result.type, function(err, newUser) {
                                            console.log(newUser);
                                            callback(null, newUser);
                                        });
                                    }
                                    else{
                                        console.log(user);
                                        callback(null, user);
                                    }
                                }
                            });
                        }
                    }
                    checkAllProviders(0, done);
                } else {
                    var shasum = crypto.createHash('sha1');
                    shasum.update(password);
                    if (user.password != shasum.digest('hex')) {
                        return done(null, false);
                    }
                    return done(null, user);
                }
            });
        }));

    /**
     * GoogleStrategy
     *
     * This strategy is used to authenticate users using their google account.
     */

    passport.use(new GoogleStrategy({
            clientID: configuration.google.clientID,
            clientSecret: configuration.google.clientSecret,
            callbackURL: configuration.server.hostname + '/auth/google/callback',
            passReqToCallback: true
        },
        function(request, accessToken, refreshToken, profile, done) {
            process.nextTick(function() {
                db.users.findByEmail(profile.emails[0].value, function(err, user) {
                    return done(null, user);
                });
            });
        }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user._id || user.id);
    });

    passport.deserializeUser(function(id, done) {
        console.log("Deserialize " + id);
        db.users.find(id, function(err, user) {
            done(err, user);
        });
    });


    /**
     * BasicStrategy & ClientPasswordStrategy
     *
     * These strategies are used to authenticate registered OAuth clients.  They are
     * employed to protect the `token` endpoint, which consumers use to obtain
     * access tokens.  The OAuth 2.0 specification suggests that clients use the
     * HTTP Basic scheme to authenticate.  Use of the client password strategy
     * allows clients to send the same credentials in the request body (as opposed
     * to the `Authorization` header).  While this approach is not recommended by
     * the specification, in practice it is quite common.
     */
    passport.use(new BasicStrategy(
        function(username, password, done) {
            db.clients.findByClientId(username, function(err, client) {
                if (err) {
                    return done(err);
                }
                if (!client) {
                    return done(null, false);
                }
                if (client.clientSecret != password) {
                    return done(null, false);
                }
                return done(null, client);
            });
        }));

    passport.use(new ClientPasswordStrategy(

        function(clientId, clientSecret, done) {
            db.clients.findByClientId(clientId, function(err, client) {
                if (err) {
                    return done(err);
                }
                if (!client) {
                    return done(null, false);
                }
                if (client.clientSecret != clientSecret) {
                    return done(null, false);
                }
                return done(null, client);
            });
        }));

    /**
     * BearerStrategy
     *
     * This strategy is used to authenticate either users or clients based on an access token
     * (aka a bearer token).  If a user, they must have previously authorized a client
     * application, which is issued an access token to make requests on behalf of
     * the authorizing user.
     */
    passport.use(new BearerStrategy(

        function(accessToken, done) {
            db.accessTokens.find(accessToken, function(err, token) {
                if (err) {
                    return done(err);
                }
                if (!token) {
                    return done(null, false);
                }

                if (token.userID !== null) {
                    db.users.find(token.userID, function(err, user) {
                        if (err) {
                            return done(err);
                        }
                        if (!user) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = {
                            scope: '*'
                        };
                        done(null, user, info);
                    });
                } else {
                    //The request came from a client only since userID is null
                    //therefore the client is passed back instead of a user
                    db.clients.findByClientId(token.clientID, function(err, client) {
                        if (err) {
                            return done(err);
                        }
                        if (!client) {
                            return done(null, false);
                        }
                        // to keep this example simple, restricted scopes are not implemented,
                        // and this is just for illustrative purposes
                        var info = {
                            scope: '*'
                        };
                        done(null, client, info);
                    });
                }
            });
        }));
}