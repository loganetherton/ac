'use strict';

angular.module('mean.taskdetails').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('taskdetails example page', {
      url: '/taskdetails/example',
      templateUrl: 'taskdetails/views/index.html'
    });
  }
]);
