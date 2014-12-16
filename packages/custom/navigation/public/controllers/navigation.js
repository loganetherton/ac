'use strict';

angular.module('mean.navigation').controller('NavigationController',
['$scope', 'Global', 'Navigation', '$rootScope', 'TaskStorageService', 'filterFilter',
function ($scope, Global, Navigation, $rootScope, TaskStorageService, filterFilter) {
    var vm = this;
    vm.global = Global;

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
    });

    var tasks;
    tasks = $scope.tasks = TaskStorageService.get();
    $scope.taskRemainingCount = filterFilter(tasks, {
        completed: false
    }).length;
    $scope.$on('taskRemaining:changed', function(event, count) {
        $scope.taskRemainingCount = count;
    });
}]);
