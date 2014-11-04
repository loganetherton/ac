(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    app.controller('TasklistController',
        ['$scope', '$stateParams', '$location', 'TasklistService', 'SocketService',
         function ($scope, $stateParams, $location, TasklistService, SocketService) {

             $scope.tasks = [];

             // Remove extraneous event listeners
             SocketService.init();

             TasklistService.init().then(function (data) {
                 // Success
                 $scope.tasks = data.data;
             }, function (error) {
                 // log error to DB
                 // TODO Make robust
                 throw new Error(error);
             });

             SocketService.on('newTask', function (data) {
                 $scope.tasks.unshift(data.data);
             });
         }]);
})();