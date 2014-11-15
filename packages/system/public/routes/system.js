/*global _:false */
'use strict';

var app = angular.module('mean.system');

//Setting up route
app.config(['$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

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
        resolve: {
            //loggedin: function (AuthenticationService) {
            //    return AuthenticationService.isAuthenticated();
            //}
        }
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
}]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

app.run(['$rootScope', '$location', 'AuthenticationService', '$state', '$timeout', 'Global',
function ($rootScope, $location, AuthenticationService, $state, $timeout, Global) {

    // enumerate routes that don't need authentication
    var loginRoutes = ['/auth'];
    var authRequiredRoutes = ['/tasklist'];

    /**
     * Routes that should not be accessed by logged in users (such as login or register)
     *
     * @param route
     * @returns {*}
     */
    var loginRoute = function (route) {
        return _.find(loginRoutes, function (loginRoute) {
            return _.str.startsWith(route, loginRoute);
        });
    };

    /**
     * Routes that require authorization (generally user routes)
     *
     * @param route
     * @returns {*}
     */
    var authRequiredRoute = function (route) {
        return _.find(authRequiredRoutes, function (loginRoute) {
            return _.str.startsWith(route, loginRoute);
        });
    };

    /**
    * Get current state for theme
    */
    var setCurrentState = function (toName) {
        var toPath;
        var lastDot = toName.lastIndexOf('.');
        toPath = toName.substring(lastDot + 1);
        //toPath = to.url.replace('/', '');
        Global.currentState = toPath;
    };

    /**
     * @todo Check out: http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
     */
    $rootScope.$on('$stateChangeStart', function (event, to, toParams, from) {
        var loggedIn = AuthenticationService.isAuthenticated();
        var transitionTo;
        // If logged in
        loggedIn.then(function () {
            // If the user is trying to go to a route used for logging in, prevent this
            if (loginRoute($location.url())) {
                $timeout(function () {
                    // Redirect back, if it's a good address to go back to
                    if (from.name && from.name !== to.name) {
                        transitionTo = from.name;
                        // Otherwise, default to myAmerica state
                    } else {
                        transitionTo = 'auth.login';
                    }
                    // Set the state for theme
                    setCurrentState(transitionTo);
                    // Transition
                    $state.go(transitionTo);
                }, 0);
                // If trying to go somewhere that isn't used for logging in, proceed
            } else {
                $timeout(function () {
                    // Set the state for theme
                    setCurrentState(to.name);
                    $state.go(to.name);
                }, 0);
            }
            // If not logged in
        }, function () {
            // If trying to go somewhere that requires authorization, kick back to myAmerica
            if (authRequiredRoute($location.url())) {
                $timeout(function () {
                    // Set the state for theme
                    setCurrentState('auth.login');
                    $state.go('auth.login');
                }, 0);
                // Otherwise, proceed
            } else {
                $timeout(function () {
                    setCurrentState(to.name);
                    $state.go(to.name);
                }, 0);
            }
        });
    });
}]);