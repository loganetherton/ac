'use strict';

var app = angular.module('mean.system',
['ui.bootstrap', 'easypiechart', 'mgo-angular-wizard', 'textAngular', 'angular-loading-bar',
 'app.ui.ctrls', 'app.ui.directives', 'app.ui.services', 'app.form.validation',
 'app.ui.form.ctrls', 'app.ui.form.directives', 'mean.tasklist','app.chart.ctrls',
 'app.chart.directives', 'ngAnimate']);

app.controller('IndexController', ['$scope', 'Global', '$location',
function ($scope, Global, $location) {
    var vm = this;
    $scope.global = Global;

    /**
     * Determine whether the current page should have the navigation pane displayed
     * @returns {boolean}
     */
    vm.noNavPage = function() {
        var path = $location.path();
        var noNavigationPages = ['/404', '/pages/500', '/login', '/register', '/register/*'];
        // Determine whether the current path should display navigation or not
        var noNavResult = noNavigationPages.map(function (page) {
            // Exact match
            if (page === path) {
                return true;
            }
            // Match * patterns on regex
            if (page.indexOf('*') !== -1) {
                var regex = new RegExp(path.substring(0, path.lastIndexOf('/')));
                // Don't include items which can't be regex
                if (!path.lastIndexOf('/')) {
                    return false;
                }
                return regex.test(path);
            }
        }).filter(function (page) {
            return !!page;
        });
        return noNavResult.length;
    };

    // Determine the size of the right pane
    vm.rightPaneLarge = true;
    $scope.$on('rightPaneSizeChange', function (event, size) {
        vm.rightPaneLarge = size;
    });

    vm.main = {
        login: 'login',
        register: 'register'
    };
}]);