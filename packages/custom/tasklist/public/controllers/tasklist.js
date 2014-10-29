'use strict';

angular.module('mean.tasklist').controller('TasklistController',
['$scope', 'Global', 'Tasklist', function ($scope, Global, Tasklist) {
    $scope.global = Global;
    $scope.strings = {
        name: 'Task list',
        project: 'Setting up'
    };
}]);
