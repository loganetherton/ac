'use strict';
var app = angular.module('mean.system');

app.directive('superman', [function () {
    return {
        restrict: 'E',
        template: '<div>Here I am to save the day!</div>'
    };
}]);

app.directive('enter', [function () {
    return function(scope, element){
        element.bind('mouseenter', function(){
            console.log('hello');
        });
    };
}]);