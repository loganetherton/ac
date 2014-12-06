/*global _:false */
'use strict';

var app = angular.module('mean.tasklist');

// Directive for listing tasks in right pane
app.directive('tasklist', ['User', function (User) {
    return {
        restrict: 'E',
        templateUrl: 'tasklist/views/directiveTemplates/tasklist-directive.html',
        scope: {
            tasks: '='
        },
        replace: false,
        link: function (scope, element, attrs) {
            var user = User.getIdentity();
            /**
             * Determine whether the user has authorization to edit this task
             * @param taskTeam Team owning this task
             * @returns {*}
             */
            scope.hasAuthTask = function (taskTeam) {
                return _.find(user.teams, function (team) {
                    return taskTeam + '' === team + '';
                });
            };
        }
    };
}]);
