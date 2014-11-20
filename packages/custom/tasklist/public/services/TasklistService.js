'use strict';

var app = angular.module('mean.tasklist');

// Favorite service for retrieving and creating tasks
app.factory('TasklistService', ['$http', 'SocketService', 'Global', 'LogService', '$q',
                         function ($http, SocketService, Global, LogService, $q) {

    return {
        // Get an initial listing of tasks, return promise
        init: function(){
            var deferred = $q.defer();
            // If the user ID is not set correctly, don't make the request
            if (!Global.hasOwnProperty('user') || !Global.user || !Global.user.hasOwnProperty('_id') || !Global.user._id) {
                deferred.reject({data: {error: 'User ID is not defined'}});
                return deferred.promise;
            }
            $http.get('/tasks/user/' + Global.user._id).then(function (response) {
                deferred.resolve(response.data);
                //return response.data;
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not resolve get requests for user tasklist'
                    }
                });
            });
            return deferred.promise;
        },
        // Create a new task
        create: function (isValid, title, content) {
            var deferred = $q.defer();
            if (isValid) {
                var task = {
                    user: Global.user._id,
                    title: title,
                    content: content
                };
                $http.post('/newTask', task).then(function (data) {
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
                deferred.reject('Invalid task model');
                return deferred.promise;
            }
        }
    };
}]);