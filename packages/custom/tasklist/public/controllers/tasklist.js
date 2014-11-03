'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', 'MeanSocket',
 function ($scope, $stateParams, $location, Global, Tasklist, MeanSocket) {
    $scope.global = Global;
     $scope.strings = {
         name: 'Task list',
         project: 'Setting up'
     };

     // Remove event listeners
     MeanSocket.init();

     Tasklist.init().then(function (data) {
         $scope.tasks = data.data;
     }, function (error) {
         // Todo implement error handler
     });

     MeanSocket.on('newTask', function (data) {
         $scope.tasks.unshift(data.data);
     });
}]);
