/*global _:false */
'use strict';

var app = angular.module('mean.system',
['ui.bootstrap', 'easypiechart', 'mgo-angular-wizard', 'textAngular', 'angular-loading-bar',
 'app.ui.ctrls', 'app.ui.directives', 'app.ui.services', 'app.form.validation',
 'app.ui.form.ctrls', 'app.ui.form.directives', 'app.tables','app.chart.ctrls',
 'app.chart.directives', 'ngAnimate']);

app.controller('IndexController', ['$scope', 'Global', '$location', function ($scope, Global, $location) {
    var vm = this;
    $scope.global = Global;

    vm.isSpecificPage = function() {
        var path;
        path = $location.path();
        return _.contains(['/404', '/pages/500', '/pages/login', '/pages/signin', '/pages/signin1', '/pages/signin2', '/pages/signup', '/pages/signup1', '/pages/signup2', '/pages/lock-screen', '/auth/login'], path);
    };

    vm.main = {
        brand: 'dry',
        name: 'Lisa Doe'
    };
}]);