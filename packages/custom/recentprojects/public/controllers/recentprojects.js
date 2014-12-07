/*global _:false */
'use strict';

angular.module('mean.recentprojects').controller('RecentprojectsController',
['$scope', 'RecentTasksService', '$rootScope', 'User', function ($scope, RecentTasksService, $rootScope, User) {
    var vm = this;
    vm.page = 1;

    var user = User.getIdentity();

    /**
     * Load tasks
     */
    vm.loadTasks = function (direction) {
        // Make the default call current
        direction = direction || 'current';
        if (direction === 'prev') {
            // Don't decrement beyond 1
            if (vm.page === 1) {
                return;
            }
            // Decrement
            vm.page = vm.page - 1;
        // increment
        } else if (direction === 'next') {
            vm.page = vm.page + 1;
        }
        // Load tasks from the project service
        RecentTasksService.loadTasks(vm.page).then(function(response){
            // If there are tasks, input them
            if (!_.isUndefined(response) && response.length) {
                vm.tasks = response;
            // Don't go beyond the last page
            } else if (vm.page > 1) {
                vm.page = vm.page - 1;
            }
        });
    };

    // Go ahead and init the tasklist
    if (user.authenticated) {
        vm.loadTasks();
    }

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        // Populate list of tasks
        vm.loadTasks();
    });
}]);
