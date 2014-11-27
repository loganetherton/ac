'use strict';

angular.module('mean.acsocket').controller('AcsocketController', ['$scope', 'Global', 'Acsocket',
  function($scope, Global, Acsocket) {
    $scope.global = Global;
    $scope.package = {
      name: 'acsocket'
    };
  }
]);
