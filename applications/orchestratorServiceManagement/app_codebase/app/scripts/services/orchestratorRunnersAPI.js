'use strict';

angular.module('orchestratorServiceManagementApp').factory('orchestratorRunnersAPI', ['$http', function($http) {
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
    remove: function(runnerID, callback){
      $http({
        method: 'DELETE',
        url: 'http://localhost:2000/runner/' + runnerID,
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    add: function(callback){
      $http({
        method: 'POST',
        url: 'http://localhost:2000/runner/spawn',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    log: function(runnerID, callback){
      $http({
        method: 'GET',
        url: 'http://localhost:2000/runner/' + runnerID + '/log',
      }).
      success(function(data, status, headers, config) {
        console.log(data);
        console.log(status);
        console.log(headers);
        console.log(config);
        callback(data);
      });
    },
    put: function() {}
  };
}]);