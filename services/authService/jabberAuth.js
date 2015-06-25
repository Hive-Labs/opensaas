module.exports = function(db) {
    var returnObj = {};
    returnObj.jabberLogin = function(req, res) {
        var jid = req.body.jid;
        var accessToken = req.body.password;

        if (jid.indexOf(".hivelabs.it") >= 0) {
            db.users.findByEmail(jid, function(err, user) {
                crypto = require('crypto');
                var shasum = crypto.createHash('sha1');
                shasum.update(accessToken);
                if (user.password != shasum.digest('hex')) {
                    res.json({
                        success: false
                    });
                } else {
                    res.json({
                        success: true
                    });
                }
            });
        } else {
            db.accessTokens.find(accessToken, function(err, token) {
                if (token && !err) {
                    db.users.find(token.userID, function(err, user) {
                        if (!error && user) {
                            console.log("Jabber auth success");
                            res.json({
                                success: true
                            });
                        } else {
                            console.log("Invalid user.");
                            console.log(err);
                            res.json({
                                success: false
                            });
                        }
                    });
                } else {
                    console.log("Invalid token.");
                    console.log(err);
                    res.json({
                        success: false
                    });
                }
            });
        }
    }
    return returnObj;
}