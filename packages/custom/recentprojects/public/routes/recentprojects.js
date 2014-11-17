'use strict';

angular.module('mean.recentprojects').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('recentprojects example page', {
      url: '/recentprojects/example',
      templateUrl: 'recentprojects/views/index.html'
    });
  }
]);
