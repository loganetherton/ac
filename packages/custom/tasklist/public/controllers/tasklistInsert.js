'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistInsertController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', 'MeanSocket', '$http',
 function ($scope, $stateParams, $location, Global, Tasklist, MeanSocket, $http) {
     $scope.global = Global;
     $scope.strings = {
         name: 'Task list', project: 'Setting up'
     };
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
      * Create a new task
      * @param isValid
      */
     $scope.create = function (isValid) {
         if (isValid) {
             var task = {
                 title: this.title,
                 content: this.content,
                 user: Global.user
             };
             $http.post('/task', task).success(function (data, status, headers, config) {
                 console.log('success');
             }).error(function (data, status, headers, config) {
                 console.log('error');
             });

             MeanSocket.emit('newTask', {
                 data: task
             });
         } else {
             $scope.submitted = true;
         }
     };
 }]);
