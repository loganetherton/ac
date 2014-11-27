'use strict';

angular.module('mean.socket').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('socket example page', {
      url: '/socket/example',
      templateUrl: 'socket/views/index.html'
    });
  }
]);
