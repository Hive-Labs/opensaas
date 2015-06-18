var request = require('request');

exports.init = function(config) {

}

exports.authenticate = function(username, password, callback) {
    var formData = {
        "Username": username,
        "Password": password,
        "DomainName": null,
        "RememberMe": true,
        "operationType": "Change",
        "returnUrl": "",
        "locale": "EN-US",
        "isMobileDevice": false,
        "ui": "Desktop"
    };

    var options = {
        method: 'POST',
        url: 'https://mypassword.uml.edu/Login',
        headers: {
            'Origin': 'https://mypassword.uml.edu',
            'Accept-Encoding': 'gzip, deflate',
            'Accept-Language': 'en-US,en;q=0.8',
            'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/43.0.2357.125 Safari/537.36',
            'Content-Type': 'application/json',
            'Accept': '*/*',
            'Referer': 'https://mypassword.uml.edu/',
            'X-Requested-With': 'XMLHttpRequest',
            'Connection': 'keep-alive'
        },
        json: true,
        body: formData
    };


    request(options, function(error, response, body) {
        // body is the decompressed response body
        //console.log('server encoded the data as: ' + (response.headers['content-encoding'] || 'identity'))
        if(body.success == true){
        	callback(null, {
        		email: username,
        		displayName: body.userSettings.Name,
        		type: "uml"
        	});
        }
        else{
        	callback(null, false);
        }
    }).on('data', function(data) {
        // decompressed data as it is received
        
    }).on('response', function(response) {
        // unmodified http.IncomingMessage object
        response.on('data', function(data) {
        })
    });
}