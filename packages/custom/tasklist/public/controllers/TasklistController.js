(function () {
'use strict';

var app = angular.module('mean.tasklist');

// For controllerAs syntax, check out: http://toddmotto.com/digging-into-angulars-controller-as-syntax/
app.controller('TasklistController', ['TasklistSocketService', 'TasklistService', 'LogService',
function (TasklistSocketService, TasklistService, LogService) {

    var vm = this;

    // Get the initial tasklist
    TasklistService.init().then(function (data) {
        vm.tasks = data;
    }, function (error) {
        // log error to DB
        // TODO Make robust
        LogService.error({
            message: 'Unable to retrieve initial tasks. Error: ' + error.data.error, stackTrace: true
        });
    });

    TasklistSocketService.on('newTask', function (data) {
        if (typeof vm.tasks !== 'undefined' && angular.isArray(vm.tasks)) {
            vm.tasks.unshift(data.data);
        }
    });
 }]);
})();