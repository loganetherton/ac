'use strict';
var app = angular.module('mean.system');

app.directive('superman', [function () {
    return {
        restrict: 'E',
        template: '<div>Here I am to save the day!</div>'
    };
}]);

app.directive('enter', [function () {
    return function(scope, element, attrs){
        element.bind('mouseenter', function(){
            console.log(attrs);
            element.addClass(attrs.enter);
        });
    };
}]);

app.directive('leave', [function () {
    return function(scope, element, attrs){
        element.bind('mouseleave', function(){
            element.removeClass(attrs.enter);
        });
    };
}]);

app.directive('addtweet', [function () {
    return function(scope, element, attrs){
        element.bind('mouseenter', function(){
            scope.$apply(attrs.addtweet);
        });
    };
}]);

app.controller('SuperheroDirController', ['$scope', function ($scope) {
    $scope.abilities = [];

    this.addStrength = function () {
        $scope.abilities.push('strength');
    };

    this.addFlight = function () {
        $scope.abilities.push('flight');
    };

    this.addSpeed = function () {
        $scope.abilities.push('speed');
    };
}]);

app.directive('superhero', [function () {
    return {
        restrict: 'A',
        scope: {},
        controller: 'SuperheroDirController',
        link: function (scope, element) {
            element.bind('mouseenter', function () {
                console.log(scope.abilities);
            });
        }
    };
}]);

app.directive('speed', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, superheroCtrl) {
            superheroCtrl.addSpeed();
        }
    };
}]);

app.directive('strength', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, superheroCtrl) {
            superheroCtrl.addStrength();
        }
    };
}]);

app.directive('flight', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, superheroCtrl) {
            superheroCtrl.addFlight();
        }
    };
}]);