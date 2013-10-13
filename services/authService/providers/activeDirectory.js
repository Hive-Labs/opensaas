var adClient = require('adclient');
var ldap;
var memberObjects;

exports.verifyCredentials = function(username, password, callback){
    ldap.authUser(username,password,function(err, result){
        if(err){
            console.log("ERROR:");
            console .log(err);
            callback(false);
        }
        else if(result){
            callback(true);
        }
    });
};

exports.init = function(settings) {
    ldap = new adClient(settings);

    ldap.getMembersOfGroupDN(function(result, memberObjects) {
        if (result && result.message) {
            console.log(result.message);
        } else if (memberObjects) {
            console.log(memberObjects);
            this.memberObjects = memberObjects;
        }
    });
};