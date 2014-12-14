'use strict';

var app = angular.module('mean.tasklist');

// Favorite service for retrieving and creating tasks
app.factory('TasklistService', ['$http', 'TasklistSocketService', 'Global', 'LogService', '$q', 'User',
function ($http, TasklistSocketService, Global, LogService, $q, User) {

    var _identity = User.getIdentity();

    return {
        // Get an initial listing of tasks, return promise
        init: function(){
            _identity = _identity || User.getIdentity();
            var deferred = $q.defer();
            // If the user ID is not set correctly, don't make the request
            if (!_identity || !_identity.hasOwnProperty('teams') || typeof _identity.teams !== 'object') {
                deferred.reject({data: {error: 'Team ID is not defined'}});
                return deferred.promise;
            }
            $http.get('/tasks/team/' + _identity.teams[0]).then(function (response) {
                if (response.status === 200) {
                    deferred.resolve(response.data);
                }
                deferred.reject();
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not get tasklist'
                    }
                });
            });
            return deferred.promise;
        }
    };
}]);