/*
 * GET home page.
 */
 var runners;
exports.init = function(runners){
this.runners = runners;
}

exports.runners = runners;

exports.index = function(req, res) {
	exports.runners.list(function(runnerList) {
		console.log(exports.runners.orchestratorIP);
		console.log("---------");
		console.log(runnerList);
		res.render('index', {
			title: 'Orchestrator Server',
			description: 'This is the control panel for the orchestrator service',
			author: 'Notoja',
			_layoutFile: true,
			databaseServiceDet: runnerList,
			authenticationServiceDet: runnerList,
			runnerList: runnerList,
			orchestratorIP: exports.runners.orchestratorIP
		});
	})

};