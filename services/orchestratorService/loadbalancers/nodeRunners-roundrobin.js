var currentRunnerIndex = 0;
var bareMetalList;

exports.currentRunnerIndex = currentRunnerIndex;
exports.bareMetalList = bareMetalList;


exports.init = function(bareMetalList) {
	this.bareMetalList = bareMetalList;
}

/*
	*Summary: This will return a JSON representing a machine that a runner can run on.
	*Return: {  ip: "ip", username: "username", 
				password: "password", runnerLocation: "somePath",
				port: "somePort"
			  }
*/
exports.nextMachine = function() {
	var runner = exports.getMachineByIndex(exports.currentRunnerIndex);
	exports.currentRunnerIndex++;
	return runner;
}


///////////////Internal methods////////////
/*
	*Summary: Returns a JSON representing a machine that a runner can run on.
	*Parameter: index - This index represents a port within a machine. For instance,
	index=0 represents the starting port of the first machine. index=last represents
	the finish port of the last machine.
*/
exports.getMachineByIndex = function(index) {

	var machineIdx = 0;
	var portIdx = exports.bareMetalList[0].portStart;
	var currMachine;
	for (var i = 0; i < index + 1; i++) {
		if (machineIdx >= exports.bareMetalList.length) {
			machineIdx = 0;
		}
		currMachine = exports.bareMetalList[machineIdx];
		if (portIdx > exports.bareMetalList[0].portFinish) {
			machineIdx++;
			var nextMachine = exports.bareMetalList[machineIdx];
			portIdx = nextMachine.portStart;
		} else {
			portIdx++;
		}
		currMachine.runnerPort = portIdx;
	}
	return currMachine;
}