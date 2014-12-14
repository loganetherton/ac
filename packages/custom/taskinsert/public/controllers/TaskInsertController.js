(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    app.controller('TaskInsertController',
    // Tasklist here is referring to the Mongo model
    ['Global', 'TasklistService', function (Global, TasklistService) {
        var vm = this;
        this.strings = Global.tasklist.strings;

        /**
         * Create a new task
         * @param valid
         */
        this.create = function (valid) {
            var defer = TasklistService.create(valid, vm.title, vm.content);

            defer.then(function () {
                vm.title = '';
                vm.content = '';
            }, function (error) {
                console.log('error: ' + error);
                // TODO Display error to user
            });
        };
    }]);
}).call(this);
