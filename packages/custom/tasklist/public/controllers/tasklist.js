'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', 'MeanSocket', '$http',
 function ($scope, $stateParams, $location, Global, Tasklist, MeanSocket, $http) {
    $scope.global = Global;
     $scope.strings = {
         name: 'Task list', project: 'Setting up'
     };

     // Remove event listeners
     MeanSocket.init();
     /**
      * Check if the user has authorization
      *
      * @param task
      * @returns {*}
      */
     $scope.hasAuthorization = function (task) {
         if (!task || !task.user) {
             return false;
         }
         return $scope.global.isAdmin || task.user._id === $scope.global.user._id;
     };
     /**
      * Query tasks from DB and make available to scope
      */
     $scope.find = function () {
         Tasklist.query(function (task) {
             $scope.tasks = task;
         });
     };

     MeanSocket.on('newTask', function (data) {
         $scope.tasks.unshift(data.data);
         //Tasklist.query(function (task) {
         //    $scope.tasks = task;
         //});
         //$http.get('/task').success(function (data, status, headers, config) {
         //    angular.forEach(data, function(value, key) {
         //        $scope.tasks.unshift(value);
         //    });
         //});
     });

     $scope.$watchCollection('tasks', function (newVal, oldVal) {
         console.log(newVal);
     });

     // Trying with $http
     //$http.get('/tasklist').success(function (data, status, headers, config) {
     //    console.log(data);
     //    console.log($scope.tasks);
     //});
}]);
