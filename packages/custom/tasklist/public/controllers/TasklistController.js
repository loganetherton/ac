(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    // For controllerAs syntax, check out: http://toddmotto.com/digging-into-angulars-controller-as-syntax/
    app.controller('TasklistController',
        ['$scope', '$location', 'SocketService',
         function ($scope, $location, SocketService) {

             var vm = this;

             //SocketService.on('newTask', function (data) {
             //    if (typeof vm.tasks !== 'undefined' && angular.isArray(vm.tasks)) {
             //        vm.tasks.unshift(data.data);
             //    }
             //});
         }]);
})();