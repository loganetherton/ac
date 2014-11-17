'use strict';

angular.module('mean.header').controller('HeaderController', ['$scope', 'Global', 'Header',
  function($scope, Global, Header) {
    $scope.global = Global;
    $scope.package = {
      name: 'header'
    };
  }
]);
