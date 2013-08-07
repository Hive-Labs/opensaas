'use strict';

angular.module('orchestratorServiceManagementApp').controller('MainCtrl', function($scope, $timeout, orchestratorRunnersAPI) {


	var cancelRefresh = $timeout(function myFunction() {
		orchestratorRunnersAPI.get(function callback(data) {
			$scope.runners = data;
		});
		cancelRefresh = $timeout(myFunction, 5000);
	}, 2000);

	$scope.terminate = function(runner) {
		$('#terminateRunnerModal').modal('show');
		$('#terminateRunnerModalHeader').text('Runner ' + runner.id);
		$('#terminateRunnerModalIp').text('IP ' + runner.ip);
		$('#terminateRunnerModalAppName').text('App Name ' + runner.appName);
		$('#terminateRunnerModalLastPing').text('Ping ' + runner.ping);
		$('#terminateRunnerModalTerminateButton').click(function() {
			orchestratorRunnersAPI.remove(runner.id, function callback(data) {
				$('#terminateRunnerModal').modal('hide');
			});
		});
	};

	$scope.addRunner = function(){
		orchestratorRunnersAPI.add(function(data){
			alert(data);	
		});
	};

	$scope.log = function(runner) {
		$('#logRunnerModal').modal('show');
			orchestratorRunnersAPI.log(runner.id, function callback(log) {
				var arrayOfLines = log;
				$("#logRunnerModalLogText").text('');
				for (var i = 0; i < arrayOfLines.length; i++) {
					var color;
					if (i % 2 == 0) {
						color = 'blue';
					} else {
						color = 'green';
					}
					$("#logRunnerModalLogText").append('<p style="color:' + color + '">' + JSON.stringify(JSON.parse(arrayOfLines[i]), null, '<br/>\t') + '</p>');
				}
			});
	};
});