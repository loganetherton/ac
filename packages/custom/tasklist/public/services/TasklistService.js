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
                var depsMap = {};
                var noDeps = tasks.map(function (task, index, arr) {
                    // If no dependencies, return the task
                    if (!task.dependencies.length) {
                        arr.splice(index, 1);
                        depsMap[task._id] = {
                            title: task.title
                        };
                        return task;
                    }
                });
                var foundDeps;
                tasks.map(function (task, key, arr) {
                    foundDeps = task.dependencies.map(function (dep, key) {
                        //console.log(dep);
                        if (_.isObject(depsMap[dep])) {
                            depsMap[dep][task._id] = {
                                title: dep.title
                            };
                            //depsMap[dep]['_id'] = task._id;
                            //depsMap[dep]['dependencies'] = task.dependencies;
                            //depsMap[dep]['title'] = task.title;
                        }
                    });
                    //console.error(foundDeps);
                });
                //console.log(depsMap);
                //console.log(noDeps);
                //console.log(tasks);
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