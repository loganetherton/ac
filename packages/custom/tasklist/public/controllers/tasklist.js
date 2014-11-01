'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', 'MeanSocket',
 function ($scope, $stateParams, $location, Global, Tasklist, MeanSocket) {
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

     MeanSocket.on('testResponse', function (data) {
         console.log('from tasklist: ' + data.data);
     });

     // Duh, this is an instance of $resource, which is being used to query the backend.
     console.log(Tasklist.get);
}]);
