(function () {
   "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('orchestratorAPI', ['$http', function($http) {
  // Public API here
  return {
    userInfo: function(callback) {
      $http({
        method: 'GET',
        url: '/api/user'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    get: function(callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:2000/runner/list'
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    listApps: function(callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:2000/applications/list'
      }).
      success(function(data, status, headers, config) {
        var uniqueNames = [];
        $.each(data, function(i, el) {
          if ($.inArray(el, uniqueNames) === -1) uniqueNames.push(el);
        });
        callback(uniqueNames);
      });
    },
    remove: function(runnerID, callback) {
      $http({
        method: 'DELETE',
        url: 'http://localhost:2000/runner/' + runnerID,
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    add: function(callback) {
      $http({
        method: 'POST',
        url: 'http://localhost:2000/runner/spawn',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    deployApp: function(appName, callback) {
      console.log('Deploying...');
      $http({
        method: 'POST',
        url: 'http://localhost:2000/applications/deploy',
        data: {
          appName: appName
        }
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    log: function(runnerID, callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:2000/runner/' + runnerID + '/log',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    status: function(runnerID, callback) {
      $http({
        method: 'GET',
        url: 'http://localhost:2000/runner/' + runnerID + '/status',
      }).
      success(function(data, status, headers, config) {
        callback(data);
      });
    },
    put: function() {}
  };
}]);