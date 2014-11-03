'use strict';

var app = angular.module('mean.tasklist');

// Favorite service for retrieving and creating tasks
app.factory('Tasklist', ['$http', 'MeanSocket', 'Global', function ($http, MeanSocket, Global) {
    var taskList;
    return {
        // Get an initial listing of tasks
        init: function(){
            return $http.get('/tasklist').success(function (data) {
                taskList = data;
            }).error(function () {
                // TODO Finish implementation of logging. For now, this will log to DB
                throw new Error('Failed to retrieve task list');
            });
        },
        // Create a new task
        create: function (isValid) {
            if (isValid) {
                var task = {
                    user: Global.user._id,
                    title: this.title,
                    content: this.content
                };
                $http.post('/task', task).success(function (data, status, headers, config) {
                    console.log('success');
                }).error(function (data, status, headers, config) {
                    console.log('error: '. data);
                });

                MeanSocket.emit('newTask', {
                    data: task
                });
            } else {
                //$scope.submitted = true;
            }
        }
    };
}]);