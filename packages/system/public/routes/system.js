'use strict';

var app = angular.module('mean.system');

//Setting up route
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

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
                $location.url('/auth/login');
            }
        });
        return deferred.promise;
    };

    // For unmatched routes:
    $urlRouterProvider.otherwise('/auth/login');

    // Temporary redirect so I can always end up on tasklist
    $urlRouterProvider.when('', '/tasklist');

    /**
     * Auth
     */
    $stateProvider.state('auth', {
        url: '/auth',
        templateUrl: 'users/views/index.html'
    })
    .state('auth.login', {
        url: '/login',
        templateUrl: 'users/views/login.html',
        resolve: {
            loggedin: !checkLoggedin
        }
    })
    .state('auth.register', {
        url: '/register',
        templateUrl: 'users/views/register.html',
        resolve: {
            loggedin: !checkLoggedin
        }
    }).state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'users/views/forgot-password.html',
        resolve: {
            loggedin: !checkLoggedin
        }
    }).state('reset-password', {
        url: '/reset/:tokenId',
        templateUrl: 'users/views/reset-password.html',
        resolve: {
            loggedin: !checkLoggedin
        }
    });

    /**
     * Tasklist
     */
    $stateProvider.state('tasklist', {
        url: '/tasklist',
        templateUrl: 'tasklist/views/index.html',
        resolve: {
            loggedin: checkLoggedin
        }
    });

    $stateProvider.state('tasklist.auth', {
        url: '/auth',
        templateUrl: 'tasklist/views/index.html',
        resolve: {
            loggedin: checkLoggedin
        }
    });

    $stateProvider.state('tasklist.query.test', {
        url: '/tasklist/querySomeBullshit',
        templateUrl: 'tasklist/views/index.html'
    });
    $stateProvider.state('tasklist open', {
        url: '/tasklist/anyone',
        templateUrl: 'tasklist/views/index.html'
    });

    //// states for my app
    //$stateProvider.state('home', {
    //    url: '/', templateUrl: 'system/views/index.html'
    //});
}]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

//app.run(['$rootScope', function ($rootScope) {
//
//    //$rootScope.$on('$stateChangeStart', function (event, toState, toParams, fromState, fromParams) {
//    //    console.log(event);
//    //    console.log(toState);
//    //    console.log(toParams);
//    //    console.log(fromState);
//    //    console.log(fromParams);
//    //});
//
//    // enumerate routes that don't need authentication
//    var routesThatDontRequireAuth = ['/login'];
//
//    // check if current location matches route
//    var routeClean = function (route) {
//        return _.find(routesThatDontRequireAuth,
//        function (noAuthRoute) {
//            return _.str.startsWith(route, noAuthRoute);
//        });
//    };
//
//    $rootScope.$on('$routeChangeStart', function (event, next, current) {
//        // if route requires auth and user is not logged in
//        if (!routeClean($location.url()) && !AuthenticationService.isLoggedIn()) {
//            // redirect back to login
//            $location.path('/login');
//        }
//    });
//}]);