'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistInsertController',
// Tasklist here is referring to the Mongo model
['$scope', '$stateParams', '$location', 'Global', 'TasklistService',
 function ($scope, $stateParams, $location, Global, TasklistService) {
     var vm = this;
     this.strings = Global.tasklist.strings;

     /**
      * Create a new task
      * @param isValid
      */
     this.create = function (valid) {
         // Make sure something valid was passed
         if (!valid) {
             return;
         }
         TasklistService.create(valid, vm.title, vm.content).then(function (data) {
             vm.title = '';
             vm.content = '';
         }, function (error) {
             console.log('error: ' + error);
             // TODO Display error to user
         });
     };
 }]);
