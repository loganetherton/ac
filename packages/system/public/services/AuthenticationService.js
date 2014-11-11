'use strict';

var app = angular.module('mean.system');

app.factory('AuthenticationService', ['$q', '$timeout', '$http', function ($q, $timeout, $http) {
    return {
        // Check whether the user is authenticated
        isAuthenticated: function () {
            // Initialize a new promise
            var deferred = $q.defer();
            // Make an AJAX call to check if the user is logged in
            $http.get('/loggedin').success(function (user) {
                // Authenticated
                if (user !== '0') {
                    $timeout(deferred.resolve);
                }
                // Not Authenticated
                else {
                    $timeout(deferred.reject);
                }
            });
            return deferred.promise;
        }
    };
}]);