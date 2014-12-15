'use strict';

angular.module('mean.overview').config(['$stateProvider',
  function($stateProvider) {
    $stateProvider.state('overview example page', {
      url: '/overview/example',
      templateUrl: 'overview/views/index.html'
    });
  }
]);
