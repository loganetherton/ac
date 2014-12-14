(function () {
    'use strict';

    var app = angular.module('mean.taskinsert');

    app.controller('TaskInsertController',
    ['Global', 'TaskInsertService', function (Global, TaskInsertService) {
        var vm = this;
        this.strings = Global.tasklist.strings;

        /**
         * Create a new task
         * @param valid
         */
        this.create = function (valid) {
            var defer = TaskInsertService.create(valid, vm.task);

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
