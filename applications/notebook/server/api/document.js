Meteor.methods({
    api_getAllDocuments: function(token) {
        var fut = new Future();
        try {
            var result = Meteor.http.get(config.authServerHost + ':' + config.authServerPort + '/api/user?access_token=' + token);
            var url = '/entity/' + config.dbAppName + "/" + config.dbRoutes.notes + "/" + result.data.user_id;
            getRequest(config.dbServerHost, config.dbServerPort, url, function(err, result) {
                if (err) {
                    if (result.data.error = "not_found") {
                        fut['return']({});
                    } else {
                        fut['return'](DBError(err));
                    }
                } else {
                    if (result.data && result.data.error) {
                        console.log("ERR");
                        fut['return'](DBError(err));
                    } else {
                        console.log("DATA");
                        console.log(result.data);
                        fut['return'](result.data || {});
                    }
                }
            });
        } catch (e) {
            fut['return'](AuthError("Bad Token"));
        }
        return fut.wait();
    }
});