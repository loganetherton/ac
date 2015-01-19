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

    /**
     * Create fake tasks to see how the graph turns out
     * @param amount
     */
    vm.createFakeTasks = function (amount) {
        CreateMockTasksService.createFakeTasks(amount).then(function (response) {
            console.log('task created', response);
        }, function (error) {
            console.log('error', error);
        });
    };
}]);
