'use strict';

var app = angular.module('mean.tasklist');

// Directive for listing tasks in right pane
app.directive('tasklist', ['HasAuthorizationService', 'TasklistService', 'LogService',
                           function (HasAuthorizationService, TasklistService, LogService) {
    return {
        restrict: 'E',
        templateUrl: 'tasklist/views/directiveTemplates/tasklist-directive.html',
        scope: {
            tasks: '='
        },
        replace: false,
        link: function (scope, element, attrs) {
            // Get the initial tasklist
            TasklistService.init().then(function (data) {
                scope.tasks = data;
            }, function (error) {
                // log error to DB
                // TODO Make robust
                LogService.error({
                    message: 'Unable to retrieve initial tasks. Error: ' + error.data.error,
                    stackTrace: true
                });
            });
        }
    };
}]);
