'use strict';

angular.module('mean.taskinsert').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('taskinsert example page', {
      url: '/taskinsert/example',
      templateUrl: 'taskinsert/views/index.html'
    });
  }
]);
