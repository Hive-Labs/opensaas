module.exports = function(httpProxy, servConf) {
    //	Will hold the list of servers currently running the app
    var HAList = [];

    //	The index of the server to which the last request was sent
    var currIndex = 0;

    return {
        setHAList: function(HAList) {
            this.HAList = HAList;
        },
        getNext: function(req, res, next) {
            console.log("Got a hit: " + req.url);

            //	Figure out the the name of the app being requested
            var appName;

            //  Store the HAList so you can use it inside callback functions
            var HAList = this.HAList;

            //  lvho.st:2002/x_app/orchestratorServiceManagement
            if (!servConf.get().server.subdomain_mode) {
                //  Check if header has cookies which tell us which machine to run on
                checkCookies(req, res, this.HAList, httpProxy, function(cookieError, cookiesValid, proxy, machine) {
                    if (!cookiesValid) {
                        console.log("Cookies were null, checking the url.");
                        //  Check if the url has which app the user is requesting
                        checkUrl(req,res, HAList, httpProxy, function(urlError, urlValid, proxy, machine){
                            next(urlError, req, proxy, machine);
                        });
                    }
                    else{
                        next(cookieError, req, proxy, machine);
                    }
                });    
            }
        }
    };

    function checkUrl(req, res, HAList, httpProxy, next) {
        //  Take the url and delimit it using '/'
        var subList = req.url.split('/');
        //  Check if the url contains x_app and store where it is found
        var xAppHeaderIndex = -1;
        for (var i = 0; i < subList.length; i++) {
            if (subList[i] == "x_app") {
                xAppHeaderIndex = i;
                break;
            }
        }
        //  If x_app was not found, then the url isn't valid.
        if(xAppHeaderIndex == 0){
            next(null, false);
            return;
        }
        else{
            //  Remove the trailing and leading slash from the url
            req.url = removeLeadingTrailingSlash(
                                req.url.replace(subList[xAppHeaderIndex] 
                                + "/" + subList[xAppHeaderIndex + 1], ""));

            //  The name of the app is right after the x_app part of the url
            appName = subList[xAppHeaderIndex + 1];

            //  Get a machine that is running this app
            getNextMachine(HAList, appName, null, function(err, machine) {
                if (err) {
                    console.log(err);
                    next(null, false);
                } else {
                    res.setHeader('Set-Cookie', 'hive_preferred_machine=' + machine.index + "~" + appName + "; path=/; Expires=" + (new Date(new Date().getTime() + 86409000).toUTCString()));

                    //  Remove the x_app and the app name from the url
                    req.url = removeXAppFromUrl(req.url, appName);
                    console.log("Serving from url as " + req.url);

                    var proxy = httpProxy.createProxyServer({
                        target: machine
                    });
                    next(null, true, proxy, machine);
                }
            });
        }
    }

    function checkCookies(req, res, HAList, httpProxy, next) {
        //  Get a list of cookies in the request header
        var cookieList = parseCookies(req);
        //  Make sure the two parts necessary exist
        if (cookieList["hive_preferred_machine"] != null) {
            //  The cookie is stored as 1~orchestratorServiceManagement
            var machineID = cookieList["hive_preferred_machine"].split("~")[0];
            var currentApp = cookieList["hive_preferred_machine"].split("~")[1];
            //  Check if the requested machine exists
            getNextMachine(HAList, currentApp, machineID, function(err, machine) {
                if (err) {
                    next(err, false);
                } else {
                    req.url = removeXAppFromUrl(req.url, currentApp);
                    console.log("Serving from cookie as " + req.url);
                    //  Proxy the user's request to this machine
                    var proxy = httpProxy.createProxyServer({
                        target: machine
                    });
                    next(null, true, proxy, machine);
                }
            });
        } else {
            next(null, false);
        }
    }

    function removeLeadingTrailingSlash(str) {
        if (str != "/" && str.substr(-1) == '/') {
            str = str.substr(0, str.length - 1);
        }
        if (str != "/" && str[0] == '/' && str.length > 2) {
            str = str.substr(1, str.length - 1);
        }
        return str;
    }

    function removeXAppFromUrl(url, appName){
        var url = url.replace("/x_app/" + appName, "").replace("/x_app", "");
        return url == "" ? "/" : url;
    }

    function parseCookies(request) {
        var list = {},
            rc = request.headers.cookie;

        rc && rc.split(';').forEach(function(cookie) {
            var parts = cookie.split('=');
            list[parts.shift().trim()] = unescape(parts.join('='));
        });

        return list;
    }

    function getNextMachine(HAList, appName, preferredMachineID, callback) {
        //	There are no runners available
        if (!HAList || HAList.length === 0) {
            callback({
                error: "There are no runners available."
            });
        }
        //  You are requesting a specific machine to run on
        else if (preferredMachineID != null && HAList[preferredMachineID] != null && HAList[preferredMachineID].appName != null && HAList[preferredMachineID].appName.toLowerCase() == appName.toLowerCase()) {
            console.log("requesting specific machine number " + preferredMachineID);
            var preferredMachine = {
                target: "http://" + HAList[preferredMachineID].host + ":" + (HAList[preferredMachineID].port + 1000),
                index: preferredMachineID
            };
            callback(null, preferredMachine);
        }
        //The machine at the current index is what you want
        else if (HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) {
            var oldIndex = currIndex;
            currIndex = (currIndex + 1) % HAList.length;
            var newMachine = {
                target: "http://" + HAList[oldIndex].host + ":" + (HAList[oldIndex].port + 1000),
                index: oldIndex
            };
            callback(null, newMachine);
        }
        //The machine at the current index is not what you want
        else {
            var start = currIndex;
            var newMachine;
            for (var i = 1; i < HAList.length; i++) { //loop through all the machines and check
                currIndex = (i + start) % HAList.length;
                if (HAList && HAList[currIndex] && HAList[currIndex].appName && HAList[currIndex].appName.toLowerCase() == appName.toLowerCase()) {
                    newMachine = {
                        target: "http://" + HAList[currIndex].host + ":" + (HAList[currIndex].port + 1000),
                        index: currIndex
                    };
                    break;
                }
            }
            if (newMachine) {
                currIndex = (currIndex + 1) % HAList.length;
                callback(null, newMachine);
            } else {
                callback({
                    error: "There are no machines running app: " + appName
                }); //return error
            }
        }
    }

}