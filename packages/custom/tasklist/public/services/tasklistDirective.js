'use strict';

var app = angular.module('mean.tasklist');

// Directive for listing tasks in right pane
app.directive('tasklist', ['hasAuthorizationService', function (hasAuthorizationService) {
    return {
        restrict: 'E',
        templateUrl: 'tasklist/views/partials/tasklist-directive.html',
        scope: {},
        controllerAs: 'tasklist',
        controller: 'TasklistController',
        link: function (scope, element) {
            scope.hasAuthorization = hasAuthorizationService;
        }
    };
}]);
