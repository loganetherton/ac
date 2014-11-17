'use strict';

angular.module('mean.activities').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('activities example page', {
      url: '/activities/example',
      templateUrl: 'activities/views/index.html'
    });
  }
]);
