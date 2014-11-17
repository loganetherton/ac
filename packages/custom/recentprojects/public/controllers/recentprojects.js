'use strict';

angular.module('mean.recentprojects').controller('RecentprojectsController',
['$scope', 'Global', 'ProjectService', '$rootScope', function ($scope, Global, ProjectService, $rootScope) {
    var vm = this;
    vm.global = Global;

    /**
     * Get recent projects
     */
    var getRecentProjects = function () {
        // Get initial activities list
        if (Global.authenticated) {
            ProjectService.list.then(function(response){
                vm.projects = response.data;
            });
        }
    };

    // Get initial list of recent projects
    getRecentProjects();

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
    });
}]);
