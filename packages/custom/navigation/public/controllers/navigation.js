'use strict';

angular.module('mean.navigation').controller('NavigationController',
['$scope', 'Global', 'Navigation', '$rootScope', function ($scope, Global, Navigation, $rootScope) {
    var vm = this;
    vm.global = Global;

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
    });
}]);
