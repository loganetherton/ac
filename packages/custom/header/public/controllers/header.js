'use strict';

angular.module('mean.header').controller('HeaderController',
['$scope', 'Global', '$rootScope', 'User', function ($scope, Global, $rootScope, User) {
    var vm = this;
    vm.global = Global;

    vm.user = User.getIdentity();

    // Update authenticated value
    $rootScope.$on('loggedin', function () {
        User.refreshIdentity().then(function (user) {
            vm.user = user;
        }, function (error) {
            // @todo Error handling
        });
    });
}]);
