'use strict';

angular.module('mean.tasklist').config(['$stateProvider', function ($stateProvider) {
    // Check if the user is connected
    var checkLoggedin = function ($q, $timeout, $http, $location) {
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
                $location.url('/login');
            }
        });

        return deferred.promise;
    };
    $stateProvider.state('tasklist example page', {
        url: '/tasklist',
        templateUrl: 'tasklist/views/index.html'
    });
    $stateProvider.state('tasklist open', {
        url: '/tasklist/example/anyone',
        templateUrl: 'tasklist/views/index.html',
        resolve: {
            //loggedin: checkLoggedin
        }
    });
}]);