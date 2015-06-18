var adClient = require('ldapjs');
var ldapClient;

exports.init = function(config) {
    ldapClient = adClient.createClient({
        url: config.url
    });
}

exports.authenticate = function(username, password, callback) {
    ldapClient.bind(username, password, function(err) {
        ldapClient.unbind();
        callback(err, err === null);
    });
}