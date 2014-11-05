'use strict';

var app = angular.module('mean.tasklist');

// Favorite service for retrieving and creating tasks
app.factory('TasklistService', ['$http', 'SocketService', 'Global', 'LogService', '$q',
                         function ($http, SocketService, Global, LogService, $q) {

    return {
        // Get an initial listing of tasks, return promise
        init: function(){
            var deferred = $q.defer();
            $http.get('/tasklist').then(function (response) {
                deferred.resolve(response.data);
                //return response.data;
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not resolve $http request to /tasklist'
                    }
                });
            });
            return deferred.promise;
        },
        // Create a new task
        create: function (isValid, title, content) {
            if (isValid) {
                var deferred = $q.defer();
                var task = {
                    user: Global.user._id,
                    title: title,
                    content: content
                };
                $http.post('/task', task).then(function (data) {
                    // Resolve and emit
                    deferred.resolve(task);
                    SocketService.emit('newTask', {
                        data: task
                    });
                }, function () {
                    deferred.reject('Failed to save new task');
                    LogService.error({
                        message: 'Failed to save new task',
                        stackTrace: true
                    });
                });
                return deferred.promise;
            } else {
                //$scope.submitted = true;
                console.log('set scope.submitted to true');
            }
        }
    };
}]);