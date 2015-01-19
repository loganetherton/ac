'use strict';

angular.module('mean.create-mock-tasks').factory('CreateMockTasksService',
['$http', '$q', 'User', function ($http, $q, User) {
    var _identity = User.getIdentity(),
        deferred;
    return {
        /**
         * Delete all of the tasks for this team
         * @returns {promise.promise}
         */
        deleteTasks: function () {
            deferred = $q.defer();
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
        },
        /**
         * Creates an estimate for the fake tasks
         * Currently, can be 1, 2, 3, or 5, weighted more towards lower numbers
         * @returns {number}
         */
        createEstimate: function () {
            var randomNumber = Math.random();
            switch (true) {
                case randomNumber > 0.9:
                    return 5;
                case randomNumber > 0.75:
                    return 3;
                case randomNumber > 0.5:
                    return 2;
                default:
                    return 1;
            }
        },
        /**
         * Return number of dependencies the new task has (at most 5, but no more than the current amount of tasks)
         * @param currentTasks
         * @returns {number}
         */
        getNumberDependencies: function (currentTasks) {
            var maxDependencies = currentTasks.length;
            maxDependencies = maxDependencies > 5 ? 5 : maxDependencies;
            return Math.round(Math.random() * maxDependencies);
        },
        /**
         * Create dependencies for the current randomly generated task
         * @param currentTasks
         * @param numberOfDependencies
         * @returns {Array}
         */
        createDependencies: function (currentTasks, numberOfDependencies) {
            var dependencies = [],
                i,
                dependentTaskKey,
                alreadySelected = [],
                currentTaskCount = currentTasks.length;
            /**
             * Returns a valid dependency key, ensuring no deplicates are placed
             * @param selectedTaskKey
             * @param movementDirection
             * @returns {*}
             */
            var getValidDependentTaskKey = function (selectedTaskKey, movementDirection) {
                // If this task has already been selected, increment or decrement by 1
                if (alreadySelected.indexOf(selectedTaskKey) !== -1) {
                    movementDirection = movementDirection || -1;
                    if (selectedTaskKey === 0) {
                        movementDirection = 1;
                    }
                    // Move on the next one
                    selectedTaskKey = selectedTaskKey + movementDirection;
                    getValidDependentTaskKey(selectedTaskKey);
                }
                // Add to hash lookup
                alreadySelected.push(selectedTaskKey);
                return selectedTaskKey;
            };
            // Randomly select the number of requested dependencies
            for (i = 0; i < numberOfDependencies; i = i + 1) {
                dependentTaskKey = getValidDependentTaskKey(Math.floor(Math.random() * currentTaskCount));
                // Place this into the dependencies array
                dependencies.push(currentTasks[dependentTaskKey]._id);
                // Add it to hash lookup so it won't be added again
                alreadySelected.push(dependentTaskKey);
            }
            return dependencies;
        },
        /**
         * Create a bunch of fake tasks to try to create various graph structures to determine problems
         * @param amount
         */
        createFakeTasks: function (amount) {
            deferred = $q.defer();
            // New task
            var task = {},
                taskNumber,
                self = this,
                numberOfDependencies;
            // Set user
            task.user = _identity._id;
            // Get all tasks
            $http.get('/tasks/team/' + _identity.teams[0]).then(function (response) {
                taskNumber = response.data.length + 1;
                task.title = 'Task' + taskNumber;
                // Create an estimate for this task
                task.estimate = self.createEstimate();
                // If there are tasks, check if we want to make this have any dependencies
                if (response.data.length) {
                    // Get the number of dependencies this task will have
                    numberOfDependencies = self.getNumberDependencies(response.data);
                    task.dependencies = self.createDependencies(response.data, numberOfDependencies);
                }
                $http.post('/newTask', task).then(function (response) {
                    deferred.resolve(response);
                }, function (error) {
                    deferred.reject(error);
                });
            });
            // Determine which, if any, dependencies the task has
            // Submit task
            return deferred.promise;
        }
    };
}]);
