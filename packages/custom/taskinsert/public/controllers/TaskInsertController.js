(function () {
    'use strict';

    var app = angular.module('mean.taskinsert');

    app.controller('TaskInsertController',
    ['Global', 'TaskInsertService', '$http', function (Global, TaskInsertService, $http) {
        var vm = this;
        // Init task
        vm.task = {
            dependencies: []
        };
        this.strings = Global.tasklist.strings;

        /**
         * Create a new task
         * @param valid
         */
        this.create = function (valid) {
            var defer = TaskInsertService.create(valid, vm.task);

            defer.then(function () {
                vm.task.title = '';
                vm.task.assigned = '';
                vm.task.estimate = '';
                vm.task.dependenciesText = '';
                vm.task.content = '';
            }, function (error) {
                console.log('error: ' + error);
                // TODO Display error to user
            });
        };

        /**
         * Query tasks for dependencies
         * @param query
         * @returns {*}
         */
        vm.queryTasks = function (query) {
            return $http.get('/queryTasklist/' + query);
        };

        /**
         * Link function on dependency being set
         * @param dependency
         */
        vm.dependencySet = function (dependency) {
            vm.task.dependencies.push(dependency._id);
        };
    }]);
}).call(this);
