'use strict';

var app = angular.module('mean.activities');

app.controller('ActivitiesCtrl', ['$scope', '$log', 'ActivityService', 'Global', '$rootScope',
function ($scope, $log, ActivityService, Global, $rootScope) {

    var vm = this;

    $scope.activeTab = 'default';
    $scope.currentActivityItems = [];
    // Global properties
    vm.global = Global;

    /**
     * Get activities list
     */
    var getActivities = function () {
        // Get initial activities list
        if (Global.authenticated) {
            ActivityService.get(function(data){
                vm.activities = data.activities;
            });
        }
    };

    // Get initial list of activities
    getActivities();

    vm.isActive = function(tab){
        return vm.activeTab === tab;
    };

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
        getActivities();
    });

    $scope.setTab = function(activityType){
        $scope.activeTab = activityType;
        ActivityService.getbytype(activityType, function(data) {
            $scope.currentActivityItems = data.data;
        });
    };
}]);