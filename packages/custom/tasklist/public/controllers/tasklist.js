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
      * Create a new task
      * @param isValid
      */
     $scope.create = function (isValid) {
         MeanSocket.emit('testSignal', {
             data: 'tasklist'
         });
         if (isValid) {
             var task = new Tasklist({
                 title: this.title, content: this.content
             });
             task.$save(function (response) {
                 $location.path('tasklist/' + response._id);
             });

             $scope.tasks.push({
                 title: task.title, content: task.content
             });

             this.title = '';
             this.content = '';
         } else {
             $scope.submitted = true;
         }
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
}]);
