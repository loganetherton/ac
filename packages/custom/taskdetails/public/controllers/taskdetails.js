'use strict';

var app = angular.module('mean.taskdetails');

app.controller('TaskdetailsController',
['$scope', 'Global', 'TaskService', '$stateParams', function ($scope, Global, TaskService, $stateParams) {
    var vm = this;
    vm.taskId = $stateParams.taskId;
    // Get the initial task
    TaskService.getTask(vm.taskId).then(function (task) {
        vm.task = task;
    }, function (error) {
        vm.error = error;
    });
}]);
