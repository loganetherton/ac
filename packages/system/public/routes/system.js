'use strict';

//Setting up route
angular.module('mean.system').config(['$stateProvider', '$urlRouterProvider',
                                      function ($stateProvider, $urlRouterProvider) {
                                          // For unmatched routes:
                                          $urlRouterProvider.otherwise('/');

                                          // Temporary redirect so I can always end up on tasklist
                                          $urlRouterProvider.when('/', '/tasklist');

                                          // states for my app
                                          $stateProvider.state('home', {
                                              url: '/', templateUrl: 'system/views/index.html'
                                          });
                                      }]).config(['$locationProvider', function ($locationProvider) {
    $locationProvider.hashPrefix('!');
}]);
