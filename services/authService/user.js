/**
 * Module dependencies.
 */
var passport = require('passport');

exports.info = [
    passport.authenticate('bearer', {
        session: false
    }),
    function(req, res) {
        // req.authInfo is set using the `info` argument supplied by
        // `BearerStrategy`.  It is typically used to indicate scope of the token,
        // and used in access control checks.  For illustrative purposes, this
        // example simply returns the scope in the response.
        res.json({
            user_id: req.user._id,
            displayName: req.user.displayName,
            scope: req.authInfo.scope,
            email: req.user.email
        });
    }
];

