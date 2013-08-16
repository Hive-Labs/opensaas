(function() {
	"use strict";
}());

angular.module('orchestratorServiceManagementApp').controller('MainCtrl', function($scope, $timeout, orchestratorRunnersAPI, orchestratorAPI) {
	orchestratorAPI.userInfo(function(userInfo) {
		$('#navBarFullName').text(userInfo.fullName);
	});

	var cancelRefresh = $timeout(function myFunction() {
		orchestratorRunnersAPI.get(function callback(data) {
			$scope.runners = data;
			setTimeout(function() {
				for (var i = 0; i < $scope.runners.length; i++) {
					if (!$scope.cpuGraphs || !$scope.cpuGraphs[i] || !$scope.cpuGraphs[i].enabled) {
						$('#toggleGraph' + i).text('Enable Graph');
					} else {
						refreshGraph($index);
					}
				}
			}, 30);
		});
		cancelRefresh = $timeout(myFunction, 15000);
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

	$scope.deploy = function() {
		$('#deployRunnerModal').modal('show');
		orchestratorAPI.listApps(function(data) {
			for (var i = 0; i < data.length; i++) {
				$('#deployRunnerModalAppName').append("<option value='" + data[i] + "'>" + data[i] + "</option>");
			}
			$('#deployRunnerModalTerminateButton').unbind('click');
			$('#deployRunnerModalTerminateButton').click(function() {
				$('#deployRunnerModal').modal('hide');
				notify('App has been deployed. It will show up in a few minutes.');
				orchestratorRunnersAPI.deployApp($('#deployRunnerModalAppName').val(), function callback(data) {});
			});
		});
	};

	$scope.addRunner = function() {
		orchestratorRunnersAPI.add(function(data) {
			notify(data);
		});
	};

	$scope.log = function(runner) {
		$('#logRunnerModal').modal('show');
		orchestratorRunnersAPI.log(runner.id, function callback(log) {
			var arrayOfLines = log;
			$("#logRunnerModalLogText").text('');
			for (var i = 0; i < arrayOfLines.length; i++) {
				var color;
				if (i % 2 === 0) {
					color = 'blue';
				} else {
					color = 'green';
				}
				$("#logRunnerModalLogText").append('<p style="color:' + color + '">' + JSON.stringify(JSON.parse(arrayOfLines[i]), null, '<br/>\t') + '</p>');
			}
		});
	};

	function updateCPUData(runnerID, graphIndex) {
		if ($scope.cpuGraphs[graphIndex].enabled) {
			orchestratorRunnersAPI.status(runnerID, function callback(status) {
				var dataCopy = $scope.cpuGraphs[graphIndex].data;
				if (dataCopy.length >= 200) {
					dataCopy = dataCopy.slice(1);
				}
				dataCopy.push([200, status.cpu]);
				var finalData = [];
				for (var i = 0; i < dataCopy.length; i++) {
					finalData.push([i, dataCopy[i][1]]);
				}
				$scope.cpuGraphs[graphIndex].data = finalData;
			});
			setTimeout(function() {
				updateCPUData(runnerID, graphIndex);
			}, 200);
		}
	}

	function notify(string) {
		$('#notificationBox').text(string);
		$('#notificationBox').removeClass('hidden');
		$('#notificationBox').addClass('show');
		setTimeout(function() {
			$('#notificationBox').removeClass('show');
			$('#notificationBox').addClass('hidden');
		}, 5000);
	}

	var refreshGraph = function(graphIndex) {
			if ($scope.cpuGraphs[graphIndex].enabled) {
				if ($('#cpuGraph' + graphIndex + " > canvas").length === 0) {
					console.log('adasd');
					$('#toggleGraph' + graphIndex).text('Disable Graph');
					var plot = $.plot("#cpuGraph" + graphIndex, [$scope.cpuGraphs[graphIndex].data], {
						series: {
							shadowSize: 0 // Drawing is faster without shadows
						},
						yaxis: {
							min: 0,
							max: 100
						},
						xaxis: {
							show: false
						}
					});
					$scope.cpuGraphs[graphIndex].plot = plot;
				}

				$scope.cpuGraphs[graphIndex].plot.setData([$scope.cpuGraphs[graphIndex].data]);
				$scope.cpuGraphs[graphIndex].plot.draw();
				setTimeout(function() {
					refreshGraph(graphIndex);
				}, 600);
			} else {
				console.log('disabled!');
			}
		};

	$scope.toggleGraph = function(runner, graphIndex) {
		$scope.cpuGraphs = ($scope.cpuGraphs) || [];
		$scope.cpuGraphs[graphIndex] = ($scope.cpuGraphs[graphIndex]) || [];
		if (!$scope.cpuGraphs[graphIndex].enabled) {
			//$('#cpuGraph' + graphIndex).css('display', 'inline-block');
			$scope.cpuGraphs[graphIndex].enabled = true;
			if (!$scope.cpuGraphs[graphIndex].data) {
				$scope.cpuGraphs[graphIndex].data = [];
				for (var i = 0; i < 200; i++) {
					$scope.cpuGraphs[graphIndex].data.push([i, 0]);
				}
			}
			updateCPUData(runner.id, graphIndex);
			refreshGraph(graphIndex);
		} else {
			$('#toggleGraph' + graphIndex).text('Enable Graph');
			$scope.cpuGraphs[graphIndex].enabled = false;
			$('#cpuGraph' + graphIndex).css('display', 'none');

		}

	};
});