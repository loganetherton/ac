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
        template: '<div ui-view></div>',
        resolve: {
            authorize: ['AuthorizationService', function (AuthorizationService) {
                return AuthorizationService.authorize();
            }]
        }
    })

    /**
    * Auth
    */
    .state('auth', {
        url: '/auth',
        templateUrl: 'users/views/index.html',
        resolve: {
            authorize: ['AuthorizationService', '$state', function (AuthorizationService, $state) {
                return AuthorizationService.checkAuthStateAccess();
            }]
        },
        data: {
            roles: []
        }
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
    })

    /**
    * Tasklist
    */
    .state('site.tasklist', {
        url: '/tasklist',
        templateUrl: 'tasklist/views/index.html',
        data: {
            roles: ['authenticated']
        }
    })

    /**
     * Team
     */
    .state('team', {
        url: '/team',
        template: '<div ui-view></div>',
        data: {
            roles: ['authenticated']
        }
    })
    .state('team.messages', {
        url: '/messages',
        templateUrl: 'tasklist/views/index.html'
    })

    /**
     * Placeholder
     */
    .state('placeholder', {
        url: '/placeholder',
        template: '<div ui-view></div>'
    })

    /**
     * Socket
     */
    .state('acsocket', {
        url: '/acsocket',
        templateUrl: 'acsocket/views/index.html'
    });

}]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);

app.run(['$rootScope', '$location', 'AuthenticationService', 'AuthorizationService',
function ($rootScope, $location, AuthenticationService, AuthorizationService) {

    $rootScope.$on('$stateChangeStart', function(event, toState, toStateParams, fromState) {
        // track the state the user wants to go to; authorization service needs this
        $rootScope.toState = toState;
        $rootScope.toStateParams = toStateParams;
        $rootScope.fromState = fromState;
        // Do an auth check if one is required
        if ('data' in toState && 'roles' in toState.data && _.find(toState.data.roles, function (role) {
            return role === 'authenticated';
        }) && AuthenticationService.isIdentityResolved()) {
            AuthorizationService.authorize();
        }
    });
}]);