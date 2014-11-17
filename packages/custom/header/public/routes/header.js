'use strict';

angular.module('mean.header').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('header example page', {
      url: '/header/example',
      templateUrl: 'header/views/index.html'
    });
  }
]);
