(function () {
    'use strict';

    var app = angular.module('mean.tasklist');

    app.controller('TasklistController',
        ['$scope', '$stateParams', '$location', 'TasklistService', 'SocketService', 'LogService',
         function ($scope, $stateParams, $location, TasklistService, SocketService, LogService) {

             $scope.tasks = [];

             // Remove extraneous event listeners
             SocketService.init();

             TasklistService.init().then(function (data) {
                 // Success
                 $scope.tasks = data.data;
             }, function (error) {
                 // log error to DB
                 // TODO Make robust
                 console.log(error);
                 LogService.error({
                     message: 'Unable to retrieve initial tasks. Error: ' + error.data.error,
                     stackTrace: true
                 });
                 $scope.error = 'ERROR';
             });

             SocketService.on('newTask', function (data) {
                 $scope.tasks.unshift(data.data);
             });
         }]);
})();