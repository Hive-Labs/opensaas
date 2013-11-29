(function () {
   "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('orchestratorRunnersAPI', ['$http', function($http) {
  // Public API here
  return {
    get: function(callback) {
      $http({
        method: 'GET',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/runners'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    remove: function(runnerID, callback){
      $http({
        method: 'DELETE',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/runners/' + runnerID,
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    add: function(callback){
      $http({
        method: 'POST',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/runners',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    deployApp: function(appName, callback){
      $http({
        method: 'POST',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/applications',
        data: {appName: appName}
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    log: function(runnerID, callback){
      $http({
        method: 'GET',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/runners/' + runnerID + '/log',
      }).
      success(function(data, status, headers, config) {
        console.log(data);
        callback(data);
      });
    },
    status: function(runnerID, callback){
      $http({
        method: 'GET',
        url: window.location.protocol + '//' + window.location.hostname + ':2000/runners/' + runnerID + '/health',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    put: function() {}
  };
}]);