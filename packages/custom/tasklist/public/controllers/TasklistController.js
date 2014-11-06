(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    // For controllerAs syntax, check out: http://toddmotto.com/digging-into-angulars-controller-as-syntax/
    app.controller('TasklistController',
        ['$scope', '$stateParams', '$location', 'TasklistService', 'SocketService', 'LogService',
         function ($scope, $stateParams, $location, TasklistService, SocketService, LogService) {

             var vm = this;
             this.tasks = [];

             TasklistService.init().then(function (data) {
                 // Success
                 vm.tasks = data;
             }, function (error) {
                 // log error to DB
                 // TODO Make robust
                 LogService.error({
                     message: 'Unable to retrieve initial tasks. Error: ' + error.data.error,
                     stackTrace: true
                 });
             });

             SocketService.on('newTask', function (data) {
                 vm.tasks.unshift(data.data);
             });

             /**
              * And here's how we do the watch when in controllerAs syntax
              */
             //$scope.$watchCollection(function () {
             //    return vm.tasks;
             //}, function (newVal) {
             //    console.log(newVal);
             //});
         }]);
})();