'use strict';

var app = angular.module('mean.system');

/**
 * Verifies whether the user has authorization to administer a specific task
 */
app.factory('hasAuthorizationService', ['Global', function (Global) {
    return function (task) {
        return Global.isAdmin || task.user._id === Global.user._id;
    };
}]);