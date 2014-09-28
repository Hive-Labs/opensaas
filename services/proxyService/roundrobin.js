module.exports = function(proxy, servConf) {
    //	Will hold the list of servers currently running the app
    var HAList = [];

    //	The index of the server to which the last request was sent
    var currIndex = 0;

    return {
        setHAList: function(HAList) {
            this.HAList = HAList;
        },
        getNext: function(req, res, next) {
            //	Figure out the the name of the app being requested
            var appName;

            var cookieList = parseCookies(req);
            console.log("GOt a hit: " + req.url);
            //	notebook.hivelabs.it
            if (servConf.get().server.subdomain_mode) {
                //	The name of the app is the first part of the domain
                appName = req.headers.host.split('.')[0];
                getNextMachine(this.HAList, appName, req.session.preferredMachine, function(err, machine) {
                    if (err) {
                        res.statusCode = 404;
                        res.end('There are no runners running this app');
                    } else {
                        req.session.preferredMachine = machine.index;
                        res.setHeader('Set-Cookie', 'hive_preferred_machine=' + machine.index);
                        res.setHeader('Set-Cookie', 'hive_current_app=' + appName);
                        proxy.createProxyServer({
                            target: machine
                        }).web(req, res, machine);
                    }
                });
            }
            //  http://lvho.st:2002/x_app/orchestratorServiceManagement
            else {
                var subList = req.url.split('/');
                var xAppHeaderIndex = -1;
                for (var i = 0; i < subList.length; i++) {
                    if (subList[i] == "x_app") {
                        xAppHeaderIndex = i;
                        break;
                    }
                }

                //  User is requesting the app for the first time, redirect them and store the app name in cookie
                if (xAppHeaderIndex > 0) {
                    req.url = stripTrailingSlash(req.url.replace(subList[xAppHeaderIndex] + "/" + subList[xAppHeaderIndex + 1], ""));
                    console.log("Changed to " + req.url);
                    //  The name of the app is the first part of the domain
                    appName = subList[xAppHeaderIndex + 1];
                    getNextMachine(this.HAList, appName, null, function(err, machine) {
                        if (err) {
                            console.log(err);
                            res.statusCode = 404;
                            res.end('There are no runners running this app');
                        } else {
                            req.session.preferredMachine = machine.index;
                            res.writeHead(303, [
                                ['Location', req.url == "/" ? req.url : req.url + "/"],
                                ['Set-Cookie', 'hive_preferred_machine=' + machine.index + "; path=/; Expires=" + (new Date(new Date().getTime() + 86409000).toUTCString())],
                                ['Set-Cookie', 'hive_current_app=' + appName + "; path=/; Expires=" + (new Date(new Date().getTime() + 86409000).toUTCString())]
                            ]);
                            res.end();
                        }
                    });
                }
                //  User already has a specific machine in mind, so give that to them
                else if (cookieList["hive_preferred_machine"] != null && cookieList["hive_current_app"]) {
                    console.log("Found a cookie with machine id: " + cookieList["hive_preferred_machine"]);
                    getNextMachine(this.HAList, cookieList["hive_current_app"], cookieList["hive_preferred_machine"], function(err, machine) {
                        if (err) {
                            console.log(err);
                            res.statusCode = 404;
                            res.end('There are no runners running this app');
                        } else {
                            proxy.createProxyServer({
                                target: machine
                            }).web(req, res, machine);
                        }
                    });
                } else {
                    console.log("Weird.");
                    console.log(cookieList);
                    console.log(req.url);
                }
            }
        }
    };

    function stripTrailingSlash(str) {
        if (str.substr(-1) == '/') {
            return str.substr(0, str.length - 1);
        }
        return str;
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
            console.log("requesting specific machine" + preferredMachineID);
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