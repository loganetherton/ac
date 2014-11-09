(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    // For controllerAs syntax, check out: http://toddmotto.com/digging-into-angulars-controller-as-syntax/
    app.controller('TasklistController',
        ['$scope', '$stateParams', '$location', 'SocketService',
         function ($scope, $stateParams, $location, SocketService) {

             var vm = this;

             SocketService.on('newTask', function (data) {
                 if (typeof vm.tasks !== 'undefined' && angular.isArray(vm.tasks)) {
                     vm.tasks.unshift(data.data);
                 }
             });

             /**
              * And here's how we do the watch when in controllerAs syntax
              */
             //$scope.$watchCollection(function () {
             //    return vm.tasks;
             //}, function (newVal) {
             //    console.log('updating vm.tasks');
             //    console.log(newVal);
             //});
         }]);
})();