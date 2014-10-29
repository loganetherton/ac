'use strict';

angular.module('mean.tasklist').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('tasklist example page', {
      url: '/tasklist/example',
      templateUrl: 'tasklist/views/index.html'
    });
  }
]);