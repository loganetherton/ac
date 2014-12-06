'use strict';

angular.module('mean.header').controller('HeaderController',
['$scope', 'Global', '$rootScope', 'User', function ($scope, Global, $rootScope, User) {
    var vm = this;
    vm.global = Global;

    vm.user = User.getIdentity();

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        vm.user = User.getIdentity();
    });
}]);
