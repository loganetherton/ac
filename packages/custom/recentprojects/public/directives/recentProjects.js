'use strict';

var app = angular.module('mean.recentprojects');

app.directive('recentProjects', [function () {
    return {
        restrict: 'EA',
        //replace: true,
        templateUrl: 'recentprojects/views/recent-projects.html',
        controller: 'RecentprojectsController',
        controllerAs: 'recentProjectsCtrl',
        scope: true,
        link: function(scope, element){
            scope.clearProjects = function(){
                scope.projects = [];
            };
        }
    };
}]);