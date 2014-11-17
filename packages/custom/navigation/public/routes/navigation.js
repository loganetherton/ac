'use strict';

angular.module('mean.navigation').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('navigation example page', {
      url: '/navigation/example',
      templateUrl: 'navigation/views/index.html'
    });
  }
]);
