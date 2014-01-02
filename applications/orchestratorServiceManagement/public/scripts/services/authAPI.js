(function () {
   "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('authAPI', ['$http', function($http) {
  var orchestratorUrl = "http://orchestrator.hivelabs.it";
  // Public API here
  return {
    get: function(callback) {
      $http({
        method: 'GET',
        url: orchestratorUrl + '/runner/list'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
  };
}]);