/*global _:false */
'use strict';

var app = angular.module('mean.system');

//Setting up route
app.config(['$stateProvider', '$urlRouterProvider',
function ($stateProvider, $urlRouterProvider) {

    // For unmatched routes:
    $urlRouterProvider.otherwise('/auth/login');

    // Always redirect to overview if nothing is selected
    $urlRouterProvider.when('', '/overview');

    $stateProvider.state('site', {
        templateUrl: 'system/views/site_layout.html',
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
            authorize: ['AuthorizationService', '$state', function (AuthorizationService) {
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
        templateUrl: 'users/views/signup.html'
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
        templateUrl: 'tasklist/views/table.html',
        data: {
            roles: ['authenticated']
        }
    })

    /**
     * Task
     */
    .state('site.task', {
        /* jshint ignore:start */
        url: '/task/{taskId:[a-f0-9]{24}}',
        /* jshint ignore:end */
        templateUrl: 'taskdetails/views/taskDetails.html',
        data: {
            roles: ['authenticated']
        }
    })
    .state('site.insertTask', {
        url: '/insert-task',
        templateUrl: 'taskinsert/views/index.html',
        data: {
            roles: ['authenticated']
        }
    })

    /**
     * Overview
     */
    .state('site.overview', {
        url: '/overview',
        templateUrl: 'overview/views/index.html',
        data: {
            roles: ['authenticated']
        }
    })

    /**
     * Create mock tasks
     */
    .state('site.createMockTasks', {
        url: '/create-mock-tasks',
        templateUrl: 'create-mock-tasks/views/index.html',
        data: {
            roles: ['authenticated']
        }
    })

    ///**
    // * Team
    // */
    //.state('team', {
    //    url: '/team',
    //    template: '<div ui-view></div>',
    //    data: {
    //        roles: ['authenticated']
    //    }
    //})
    //.state('team.messages', {
    //    url: '/messages',
    //    templateUrl: 'tasklist/views/index.html'
    //})

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
    /**
     * Resize the right pane on state change
     */
    var resizeRightPane = function (toState) {
        var smallRight = ['site.overview'];
        var large = true;
        if(_.contains(smallRight, toState.name)) {
            large = false;
        }
        $rootScope.$broadcast('rightPaneSizeChange', large);
    };

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
        resizeRightPane(toState);
    });
}]);