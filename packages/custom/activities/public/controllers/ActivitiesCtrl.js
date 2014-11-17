'use strict';

var app = angular.module('mean.activities');

app.controller('ActivitiesCtrl', ['$scope', '$log', 'ActivityService', function ($scope, $log, ActivityService) {
    $scope.activeTab = 'default';
    $scope.currentActivityItems = [];

    // Get initial activities list
    ActivityService.get(function(data){
        $scope.activities = data.activities;
    });

    $scope.isActive = function(tab){
        return $scope.activeTab === tab;
    };

    $scope.setTab = function(activityType){
        $scope.activeTab = activityType;
        ActivityService.getbytype(activityType, function(data) {
            $scope.currentActivityItems = data.data;
        });
    };
}]);