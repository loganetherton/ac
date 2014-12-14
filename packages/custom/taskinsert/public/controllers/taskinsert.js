'use strict';

angular.module('mean.taskinsert').controller('TaskinsertController', ['$scope', 'Global', 'Taskinsert',
  function($scope, Global, Taskinsert) {
    $scope.global = Global;
    $scope.package = {
      name: 'taskinsert'
    };
  }
]);
