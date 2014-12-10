'use strict';

angular.module('mean.taskdetails').controller('TaskdetailsController', ['$scope', 'Global', 'TaskService',
  function($scope, Global, TaskService) {
    $scope.global = Global;
    $scope.package = {
      name: 'taskdetails'
    };
  }
]);
