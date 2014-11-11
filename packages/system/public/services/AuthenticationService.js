'use strict';

var app = angular.module('mean.system');

app.factory('AuthenticationService', [function () {
    return {
        // Check whether the user is authenticated
        isAuthenticated: function ($q, $timeout, $http, $location) {
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
                    $location.url('/auth/login');
                }
            });
            return deferred.promise;
        }
    };
}]);