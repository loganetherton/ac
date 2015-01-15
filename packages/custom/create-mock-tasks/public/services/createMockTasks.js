'use strict';

angular.module('mean.create-mock-tasks').factory('CreateMockTasksService',
['$http', '$q', 'User', function ($http, $q, User) {
    var _identity = User.getIdentity();
    return {
        /**
         * Delete all of the tasks for this team
         * @returns {promise.promise}
         */
        deleteTasks: function () {
            var deferred = $q.defer();
            // Send a request to get rid of all of the tasks
            $http.get('/tasks/deleteAll/' + _identity.teams[0]).then(function (response) {
                if (response.status === 200) {
                    // Get task dependencies
                    deferred.resolve(response.data);
                }
                deferred.reject();
            }, function (error) {
                deferred.reject({
                    data: {
                        error: error
                    }
                });
            });
            return deferred.promise;
        }
    };
}]);
