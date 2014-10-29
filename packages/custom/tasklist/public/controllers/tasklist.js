'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', function ($scope, $stateParams, $location, Global, Tasklist) {
    $scope.global = Global;
    $scope.strings = {
        name: 'Task list',
        project: 'Setting up'
    };
    /**
     * Check if the user has authorization
     *
     * @param task
     * @returns {*}
     */
    $scope.hasAuthorization = function (task) {
        if (!task || !task.user) {
            return false;
        }
        return $scope.global.isAdmin || task.user._id === $scope.global.user._id;
    };
    /**
     * Create a new task
     * @param isValid
     */
    $scope.create = function (isValid) {
        if (isValid) {
            var task  = new Tasklist({
                title: this.title,
                content: this.content
            });
            task.$save(function (response) {
                $location.path('tasklist/' + response._id);
            });

            this.title = '';
            this.content = '';
        } else {
            $scope.submitted = true;
        }
    };
    /**
     * Query tasks from DB and make available to scope
     */
    $scope.find = function () {
        Tasklist.query(function (task) {
            console.log(task);
            $scope.tasks = task;
        });
    };

    $scope.$watch('tasks', function(newVal, oldVal) {
        console.log($scope.tasks);
    });
}]);
