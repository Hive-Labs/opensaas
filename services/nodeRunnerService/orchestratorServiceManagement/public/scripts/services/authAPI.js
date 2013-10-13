(function () {
   "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('authAPI', ['$http', function($http) {
  // Public API here
  return {
    get: function(callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:2000/runner/list'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
  };
}]);