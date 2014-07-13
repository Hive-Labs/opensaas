(function() {
    "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('orchestratorAPI', ['$http',
    function($http) {
        var orchestratorUrl = "http://localhost:2000";
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
                    url: orchestratorUrl + '/runners'
                }).
                success(function(data, status, headers, config) {
                    callback(data);
                });
            },
            listApps: function(callback) {
                $http({
                    method: 'GET',
                    url: orchestratorUrl + '/applications'
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
                    url: orchestratorUrl + '/runner/' + runnerID,
                }).
                success(function(data, status, headers, config) {
                    callback(data);
                });
            },
            add: function(callback) {
                $http({
                    method: 'POST',
                    url: orchestratorUrl + '/runners',
                }).
                success(function(data, status, headers, config) {
                    callback(data);
                });
            },
            deployApp: function(appName, callback) {
                $http({
                    method: 'POST',
                    url: orchestratorUrl + '/applications',
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
                    url: orchestratorUrl + '/runners/' + runnerID + '/log',
                }).
                success(function(data, status, headers, config) {
                    callback(data);
                });
            },
            status: function(runnerID, callback) {
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
    }
]);