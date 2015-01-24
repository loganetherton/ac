'use strict';

var app = angular.module('mean.header');

app.directive('userDropdown', [function () {
    return {
        templateUrl: 'header/views/directiveTemplates/userDropdown.html',
        restrict: 'E',
        controller: 'HeaderController',
        controllerAs: 'headerCtrl',
        link: function (scope, element, attrs, controller) {

        }
    };
}]);