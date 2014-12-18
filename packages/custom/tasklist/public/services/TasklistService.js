/*global _:false */
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
                    // Get task dependencies
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
        },
        /**
         * Retrieve the tasks for this team and order them for drawing
         * @returns {*}
         */
        getTasksForGraph: function () {
            _identity = _identity || User.getIdentity();
            var deferred = $q.defer();
            // If the user ID is not set correctly, don't make the request
            if (!_identity || !_identity.hasOwnProperty('teams') || typeof _identity.teams !== 'object') {
                deferred.reject({data: {error: 'Team ID is not defined'}});
                return deferred.promise;
            }
            /**
             * Algorithm:
             * 1) Iterate tasks. Find all tasks without dependencies. Separate these out into a new array
             * 2) Iterate independent tasks. Find the tasks which depend on these tasks
             * 3) Find duplicate dependencies, assign extra weight
             */
            $http.get('/tasks/team/graph/' + _identity.teams[0]).then(function (response) {
                var tasks = _.clone(response.data);
                /**
                 * 1) Get all tasks without dependencies, as they will form the top level
                 */
                var noDeps = tasks.map(function (task) {
                    // If no dependencies, return the task
                    if (!task.dependencies.length) {
                        return task;
                    }
                }).filter(function (task) {
                    return !_.isUndefined(task);
                });
                // Remove the tasks without dependencies, as we'll not be working on those anymore
                tasks = tasks.filter(function (task) {
                    return task.dependencies.length;
                });
                /**
                 * 2) Create object composed of tasks without dependencies
                 */
                var depsMap = {};
                noDeps.forEach(function (val) {
                    depsMap[val.id] = val;
                    depsMap[val.id].children = {};
                });
                /**
                 * 3) Find items which depend on the items that don't themselves have dependencies
                 */
                // We'll end up with tasks being an array of all tasks which don't have top level dependencies
                var tasksWithoutTopLevelDeps = tasks.map(function (task) {
                    task.dependencies.forEach(function (dep) {
                        if (depsMap[dep]) {
                            depsMap[dep].children[task.id] = task;
                            return null;
                        }
                        return task;
                    });
                }).filter(function (task) {
                    return !_.isUndefined(task);
                });
                console.log(tasksWithoutTopLevelDeps);
                console.log(depsMap);
                /**
                 * 4) Find items in the dependencies map who share multiple parents
                 *
                 * This is going to need to be a recursive algorithm
                 */
                _.forOwn(depsMap, function (task) {
                    console.log(task);
                });

                if (response.status === 200) {
                    // Get task dependencies
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