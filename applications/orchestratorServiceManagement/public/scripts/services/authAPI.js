(function() {
    "use strict";
}());

angular.module('orchestratorServiceManagementApp').factory('authAPI', ['$http',
    function($http) {
        var orchestratorUrl = "localhost:2000";
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
    }
]);