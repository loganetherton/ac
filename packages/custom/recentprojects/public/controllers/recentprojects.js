'use strict';

angular.module('mean.recentprojects').controller('RecentprojectsController', ['$scope', 'Global', 'Recentprojects',
  function($scope, Global, Recentprojects) {
    $scope.global = Global;
    $scope.package = {
      name: 'recentprojects'
    };
  }
]);
