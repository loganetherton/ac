'use strict';

angular.module('mean.create-mock-tasks').controller('CreateMockTasksController',
['$scope', 'CreateMockTasksService', function ($scope, CreateMockTasksService) {
    var vm = this;
    // Text for the delete tasks button
    vm.deleteButtonText = 'Do it! Delete all them tasks!';

    vm.deleteAll = function () {
        CreateMockTasksService.deleteTasks().then(function () {
            vm.deleteButtonText = 'Oh, goodness me! They\'re all gone!';
        }, function (error) {
            vm.deleteButtonText = 'Something done went wrong.';
            console.log(error);
        });
    };
}]);
