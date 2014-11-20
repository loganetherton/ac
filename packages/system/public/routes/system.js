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

    $stateProvider.state('site', {
        abstract: true,
        resolve: {
            authorize: ['AuthorizationService', function (AuthorizationService) {
                return AuthorizationService.authorize();
            }]
        }
    });

    /**
    * Auth
    */
    $stateProvider.state('auth', {
        url: '/auth',
        templateUrl: 'users/views/index.html',
        resolve: {
            authorize: ['AuthorizationService', function (AuthorizationService) {
                return !AuthorizationService.authorize();
            }]
        },
        data: {
            roles: []
        }
        //onEnter: function () {
        //    //console.log('entering auth parent state');
        //}
    })
    .state('auth.login', {
        url: '/login',
        templateUrl: 'users/views/login.html'
    })
    .state('auth.register', {
        url: '/register',
        templateUrl: 'users/views/register.html'
    }).state('forgot-password', {
        url: '/forgot-password',
        templateUrl: 'users/views/forgot-password.html'
    }).state('reset-password', {
        url: '/reset/:tokenId',
        templateUrl: 'users/views/reset-password.html'
    });

    /**
    * Tasklist
    */
    $stateProvider.state('site.tasklist', {
        url: '/tasklist',
        templateUrl: 'tasklist/views/index.html',
        data: {
            roles: ['authenticated']
        }
    });

    /**
     * Team
     */
    $stateProvider.state('team', {
        url: '/team',
        template: '<div ui-view></div>'
    });

    $stateProvider.state('team.messages', {
        url: '/messages',
        templateUrl: 'tasklist/views/index.html'
    });

    /**
     * Placeholder
     */
    $stateProvider.state('placeholder', {
        url: '/placeholder',
        template: '<div ui-view></div>'
    });
}]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

app.run(['$rootScope', '$location', 'AuthenticationService', 'AuthorizationService', '$state', '$timeout',
function ($rootScope, $location, AuthenticationService, AuthorizationService, $state, $timeout) {

    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams) {
        // track the state the user wants to go to; authorization service needs this
        $rootScope.toState = toState;
        //console.log(toState);
        $rootScope.toStateParams = toStateParams;
        //console.log(toStateParams);
        // if the principal is resolved, do an authorization check immediately. otherwise,
        // it'll be done when the state it resolved.
        if (AuthenticationService.isIdentityResolved()) {
            AuthorizationService.authorize();
        }
    });

    //// enumerate routes that don't need authentication
    //var loginRoutes = ['/auth'];
    //var authRequiredRoutes = ['/tasklist'];
    //
    ///**
    //* Routes that should not be accessed by logged in users (such as login or register)
    //*
    //* @param route
    //* @returns {*}
    //*/
    //var loginRoute = function (route) {
    //    return _.find(loginRoutes, function (loginRoute) {
    //        return _.str.startsWith(route, loginRoute);
    //    });
    //};
    //
    ///**
    //* Routes that require authorization (generally user routes)
    //*
    //* @param route
    //* @returns {*}
    //*/
    //var authRequiredRoute = function (route) {
    //    return _.find(authRequiredRoutes, function (loginRoute) {
    //        return _.str.startsWith(route, loginRoute);
    //    });
    //};
    //
    ///**
    //* Get current state for theme
    //*/
    //var setCurrentState = function (toName) {
    //    var toPath;
    //    var lastDot = toName.lastIndexOf('.');
    //    toPath = toName.substring(lastDot + 1);
    //    //toPath = to.url.replace('/', '');
    //    Global.currentState = toPath + ' fixed-navigation fixed-header';
    //};
    //
    ///**
    //* @todo Check out: http://stackoverflow.com/questions/22537311/angular-ui-router-login-authentication
    //*/
    //$rootScope.$on('$stateChangeStart', function (event, to, toParams, from) {
    //    var loggedIn = AuthenticationService.isAuthenticated();
    //    var transitionTo;
    //
    //    // Stop the transition until access is granted
    //    event.preventDefault();
    //    // If logged in
    //    loggedIn.then(function () {
    //        // If the user is trying to go to a route used for logging in, prevent this
    //        if (loginRoute($location.url())) {
    //            $timeout(function () {
    //                // Redirect back, if it's a good address to go back to
    //                if (from.name && from.name !== to.name) {
    //                    transitionTo = from.name;
    //                    // Otherwise, default to myAmerica state
    //                } else {
    //                    transitionTo = 'auth.login';
    //                }
    //                // Set the state for theme
    //                setCurrentState(transitionTo);
    //                // Transition
    //                $state.go(transitionTo);
    //            }, 0);
    //            // If trying to go somewhere that isn't used for logging in, proceed
    //        } else {
    //            $timeout(function () {
    //                // Set the state for theme
    //                setCurrentState(to.name);
    //                $state.go(to.name);
    //            }, 0);
    //        }
    //        // If not logged in
    //    }, function () {
    //        // If trying to go somewhere that requires authorization, kick back to myAmerica
    //        if (authRequiredRoute($location.url())) {
    //            $timeout(function () {
    //                // Set the state for theme
    //                setCurrentState('auth.login');
    //                $state.go('auth.login');
    //            }, 0);
    //            // Otherwise, proceed
    //        } else {
    //            $timeout(function () {
    //                setCurrentState(to.name);
    //                $state.go(to.name);
    //            }, 0);
    //        }
    //    });
    //});
}]);