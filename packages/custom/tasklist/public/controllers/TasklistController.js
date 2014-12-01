(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    // For controllerAs syntax, check out: http://toddmotto.com/digging-into-angulars-controller-as-syntax/
    app.controller('TasklistController',
        ['$scope', '$location', 'TasklistSocketService',
         function ($scope, $location, TasklistSocketService) {

             var vm = this;

             TasklistSocketService.emit('fuck');

             TasklistSocketService.on('newTask', function (data) {
                 if (typeof vm.tasks !== 'undefined' && angular.isArray(vm.tasks)) {
                     vm.tasks.unshift(data.data);
                 }
             });
         }]);
})();