'use strict';

angular.module('mean.recentprojects').controller('RecentprojectsController',
['$scope', 'Global', 'ProjectService', '$rootScope', function ($scope, Global, ProjectService, $rootScope) {
    var vm = this;
    vm.global = Global;
    vm.page = 1;

    /**
     * Get recent projects
     */
    vm.getRecentProjects = function () {
        // Get initial activities list
        if (Global.authenticated) {
            ProjectService.list().then(function(response){
                vm.projects = response.data;
            });
        }
    };
    // Go ahead and init the tasklist
    vm.getRecentProjects();

    /**
     * Load additional tasks
     */
    vm.loadMoreTasks = function (direction) {
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
        ProjectService.loadMore(vm.page).then(function(response){
            // Load more data
            if (response.data.length) {
                vm.projects = response.data;
            // Don't go beyond the last page
            } else {
                vm.page = vm.page - 1;
            }
        });
    };

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
        // Populate list of tasks
        vm.getRecentProjects();
    });
}]);
