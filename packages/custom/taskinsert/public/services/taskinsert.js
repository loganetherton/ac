'use strict';

angular.module('mean.taskinsert').factory('TaskInsertService', ['$http', 'TasklistSocketService', 'Global', 'LogService', '$q', 'User',
function ($http, TasklistSocketService, Global, LogService, $q, User) {

    var _identity = User.getIdentity();

    return {
    // Create a new task
        create: function (isValid, task) {
            var deferred = $q.defer();
            if (isValid) {
                var task = task;
                task.user = _identity._id;
                $http.post('/newTask', task).then(function (data) {
                    // Resolve and emit
                    deferred.resolve();
                    TasklistSocketService.emit('newTask', {
                        data: data.data
                    });
                }, function (err) {
                    deferred.reject('Failed to save new task');
                    LogService.error({
                        message: 'Failed to save new task', stackTrace: true, err: err
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
