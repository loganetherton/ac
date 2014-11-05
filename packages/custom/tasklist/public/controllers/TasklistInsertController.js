'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistInsertController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'TasklistService',
 function ($scope, $stateParams, $location, Global, TasklistService) {
     $scope.global = Global;
     $scope.strings = Global.tasklist.strings;

     /**
      * Create a new task
      * @param isValid
      */
     $scope.create = function (valid) {
         // Make sure something valid was passed
         if (!valid) {
             return;
         }
         TasklistService.create(valid, $scope.title, $scope.content).then(function (data) {
             $scope.title = '';
             $scope.content = '';
         }, function (error) {
             console.log('error: ' + error);
             // TODO Display error to user
         });
     };
 }]);