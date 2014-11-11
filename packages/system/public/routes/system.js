/*global _:false */
'use strict';

var app = angular.module('mean.system');

//Setting up route
app.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {

    // For unmatched routes:
    $urlRouterProvider.otherwise('/auth/login');

    // Temporary redirect so I can always end up on tasklist
    $urlRouterProvider.when('', '/tasklist');

    /**
    * Auth
    */
    $stateProvider.state('auth', {
        url: '/auth',
        templateUrl: 'users/views/index.html',
        //resolve: {
        //    //loggedin: !checkLoggedin
        //},
        //onEnter: function () {
        //    //console.log('entering auth parent state');
        //}
    })
    .state('auth.login', {
        url: '/login',
        templateUrl: 'users/views/login.html',
    })
    .state('auth.register', {
        url: '/register',
        templateUrl: 'users/views/register.html',
    }).state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'users/views/forgot-password.html',
    }).state('reset-password', {
        url: '/reset/:tokenId',
        templateUrl: 'users/views/reset-password.html',
    });

    /**
    * Tasklist
    */
    $stateProvider.state('tasklist', {
        url: '/tasklist',
        templateUrl: 'tasklist/views/index.html',
    });

    $stateProvider.state('tasklist.auth', {
        url: '/auth',
        templateUrl: 'tasklist/views/index.html',
    });

    $stateProvider.state('tasklist.query.test', {
        url: '/tasklist/querySomeBullshit',
        templateUrl: 'tasklist/views/index.html'
    });
    $stateProvider.state('tasklist open', {
        url: '/tasklist/anyone',
        templateUrl: 'tasklist/views/index.html'
    });

    // states for my app
    //$stateProvider.state('home', {
    //    url: '/', templateUrl: 'system/views/index.html'
    //});
}]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

app.run(['$rootScope', '$location', 'AuthenticationService', '$state', '$timeout',
         function ($rootScope, $location, AuthenticationService, $state, $timeout) {

    // enumerate routes that don't need authentication
    var routesThatDontRequireAuth = ['/auth'];

    // check if current location matches route
    var routeClean = function (route) {
        //console.log(route);
        return _.find(routesThatDontRequireAuth, function (noAuthRoute) {
            //console.log(noAuthRoute);
            return _.str.startsWith(route, noAuthRoute);
        });
    };

    $rootScope.$on('$stateChangeStart', function (event, to, toParams, from) {
        // if route requires auth and user is not logged in
        var loggedIn = AuthenticationService.isAuthenticated();
        // If logged in
        loggedIn.then(function () {
            if (routeClean($location.url())) {
                $timeout(function () {
                    console.log(from.name);
                    console.log(to.name);
                    // Redirect back, if it's a good address to go back to
                    if (from.name && from.name !== to.name) {
                        $state.go(from.name);
                    // Otherwise, kick them back to tasklist state
                    } else {
                        $state.go('tasklist');
                    }
                }, 0);
            }
        }, function () {
            if (!routeClean($location.url())) {
                // This needs to be wrapped in timeout() so that it won't interrupt the current state change
                $timeout(function () {
                    $state.go('auth.login');
                }, 0);
            }
        });
    });
}]);