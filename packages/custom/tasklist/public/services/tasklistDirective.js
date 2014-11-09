'use strict';

var app = angular.module('mean.tasklist');

// Directive for listing tasks in right pane
app.directive('tasklist', ['hasAuthorizationService', 'TasklistService', 'LogService',
                           function (hasAuthorizationService, TasklistService, LogService) {
    return {
        restrict: 'E',
        templateUrl: 'tasklist/views/directiveTemplates/tasklist-directive.html',
        scope: {},
        replace: false,
        controllerAs: 'tasklist',
        controller: 'TasklistController',
        link: function (scope, element, attrs, controller) {
            scope.hasAuthorization = hasAuthorizationService;
            // Get the initial tasklist
            TasklistService.init().then(function (data) {
                controller.tasks = data;
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
