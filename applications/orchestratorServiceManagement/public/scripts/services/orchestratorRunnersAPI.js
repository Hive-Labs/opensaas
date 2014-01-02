(function () {
   "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('orchestratorRunnersAPI', ['$http', function($http) {
  var orchestratorUrl = "http://orchestrator.hivelabs.it";
  
  // Public API here
  return {
    get: function(callback) {
      $http({
        method: 'GET',
        url: orchestratorUrl + '/runners'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    remove: function(runnerID, callback){
      $http({
        method: 'DELETE',
        url: orchestratorUrl + '/runners/' + runnerID,
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    add: function(callback){
      $http({
        method: 'POST',
        url: orchestratorUrl + '/runners',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    deployApp: function(appName, callback){
      $http({
        method: 'POST',
        url: orchestratorUrl + '/applications',
        data: {appName: appName}
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    log: function(runnerID, callback){
      $http({
        method: 'GET',
        url: orchestratorUrl + '/runners/' + runnerID + '/log',
      }).
      success(function(data, status, headers, config) {
        console.log(data);
        callback(data);
      });
    },
    status: function(runnerID, callback){
      $http({
        method: 'GET',
        url: orchestratorUrl + '/runners/' + runnerID + '/health',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    put: function() {}
  };
}]);