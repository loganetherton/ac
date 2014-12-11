'use strict';

var app = angular.module('mean.tasklist');

app.directive('taskFocus', ['$timeout', function($timeout) {
    return {
        link: function(scope, ele, attrs) {
            return scope.$watch(attrs.taskFocus, function(newVal) {
                if (newVal) {
                    return $timeout(function() {
                        return ele[0].focus();
                    }, 0, false);
                }
            });
        }
    };
}]);