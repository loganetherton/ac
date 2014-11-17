'use strict';

var app = angular.module('mean.recentprojects');

app.directive('recentProjects', ['ProjectService', function (ProjectService) {
    return {
        restrict: 'EA',
        //replace: true,
        templateUrl: 'recentprojects/views/recent-projects.html',
        scope: true,
        link: function(scope, element){

            ProjectService.list.then(function(response){
                scope.projects = response.data;
            });

            scope.clearProjects = function(){
                scope.projects = [];
            };
        }
    };
}]);