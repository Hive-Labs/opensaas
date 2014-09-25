module.exports = function(servConf) {
    //	Will hold the list of servers currently running the app
    var HAList = [];

    //	The index of the server to which the last request was sent
    var currIndex = 0;

    return {
        getNext = function(req, res) {
            //	Figure out the the name of the app being requested
            var appName;

            //	notebook.hivelabs.it
            if (servConf.get().server.subdomain_mode) {
                //	The name of the app is the first part of the domain
                appName = req.headers.host.split('.')[0];
                getNextMachine(appName, req.session.preferredMachine, function(err, machine) {
                    if (err) {
                        res.statusCode = 404;
                        res.end('There are no runners running this app');
                    } else {
                        req.session.preferredMachine = machine.index;
                        res.cookie('hive_preferred_machine', machine.index);
                        return proxy.web(req, res, machine);
                    }
                });
            }

        };
    };

    function getNextMachine(appName, preferredMachineID, callback) {
        //	There are no runners available
        if (!HAList || HAList.length === 0) {
            callback({
                error: "There are no runners available."
            });
        }
        //  You are requesting a specific machine to run on
        else if (preferredMachineID != null && HAList[preferredMachineID] != null && HAList[preferredMachineID].appName.toLowerCase() == appName.toLowerCase()) {
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