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
                console.log(controller);
                controller.tasks = data;
                //console.log(controller.tasks);
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
