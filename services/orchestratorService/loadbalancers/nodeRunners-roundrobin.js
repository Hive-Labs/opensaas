module.exports = function(bareMetalList) {
    var currentRunnerIndex = 0;
/*
    *Summary: This will return a JSON representing a machine that a runner can run on.
    *Return: {  ip: "ip", username: "username", 
                password: "password", runnerLocation: "somePath",
                port: "somePort"
              }
*/
    exports.nextMachine = function(callback) {
        getMachineByIndex(currentRunnerIndex, function(err, machine) {
            currentRunnerIndex++;
            callback(null, machine);
        });
    };

/*
    *Summary: Returns a JSON representing a machine that a runner can run on.
    *Parameter: index - This index represents a port within a machine. For instance,
    index=0 represents the starting port of the first machine. index=last represents
    the finish port of the last machine.
*/

    function getMachineByIndex(index, callback) {
        var machineIdx = 0;
        var portIdx = bareMetalList[0].portStart;
        var currMachine;
        for (var i = 0; i < index + 1; i++) {
            if (machineIdx >= bareMetalList.length) {
                machineIdx = 0;
            }
            currMachine = bareMetalList[machineIdx];
            if (portIdx > bareMetalList[0].portFinish) {
                machineIdx++;
                var nextMachine = bareMetalList[machineIdx];
                portIdx = nextMachine.portStart;
            } else {
                portIdx++;
            }
            currMachine.runnerPort = portIdx;
        }
        callback(null, currMachine);
    }

    return exports;
};