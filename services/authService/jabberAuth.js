module.exports = function(db) {
    var returnObj = {};
    returnObj.jabberLogin = function(req, res) {
        var jid = req.body.jid;
        var accessToken = req.body.password;
        db.accessTokens.find(accessToken, function(err, token) {
            if (token && !err) {
                db.users.find(token.userID, function(err, user) {
                    if (!error && user) {
                        res.json({
                            success: true;
                        });
                    } else {
                        res.json({
                            success: false;
                        });
                    }
                });
            } else {
                res.json({
                    success: false;
                });
            }
        });
    };
    return returnObj;
}