'use strict';

var app = angular.module('mean.users');

/**
 * Controller for the acTogglePassword directive
 */
app.controller('togglePasswordDirCtrl', [function () {
    var vm = this;

    // Maintain state
    vm.passwordInput = {
        iconClass: '',
        tooltipText: 'Show password'
    };
}]);