'use strict';

angular.module('mean.taskdetails').controller('TaskdetailsController', ['$scope', 'Global', 'Taskdetails',
  function($scope, Global, Taskdetails) {
    $scope.global = Global;
    $scope.package = {
      name: 'taskdetails'
    };
  }
]);
