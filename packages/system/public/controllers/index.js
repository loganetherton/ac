'use strict';

var app = angular.module('mean.system');

app.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}]);