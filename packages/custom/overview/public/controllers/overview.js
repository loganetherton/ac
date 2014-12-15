'use strict';

angular.module('mean.overview').controller('OverviewController', ['$scope', 'Global', 'Overview',
  function($scope, Global, Overview) {
    $scope.global = Global;
    $scope.package = {
      name: 'overview'
    };
  }
]);
