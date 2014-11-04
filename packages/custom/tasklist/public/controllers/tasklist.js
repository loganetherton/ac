'use strict';

var app = angular.module('mean.tasklist');

app.controller('TasklistController',

['$scope', '$stateParams', '$location', 'Tasklist', 'MeanSocket',
 function ($scope, $stateParams, $location, Tasklist, MeanSocket) {

     // Remove extraneous event listeners
     MeanSocket.init();

     Tasklist.init().then(function (data) {
         // Success
         $scope.tasks = data.data;
     }, function (error) {
         // log error to DB
         // TODO Make robust
         throw new Error(error);
     });

     MeanSocket.on('newTask', function (data) {
         $scope.tasks.unshift(data.data);
     });
}]);
