'use strict';

angular.module('mean.header').controller('HeaderController',
['$scope', 'Global', '$rootScope', function ($scope, Global, $rootScope) {
    var vm = this;
    vm.global = Global;

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.global.authenticated = true;
    });
}]);
