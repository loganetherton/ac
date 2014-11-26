'use strict';

var app = angular.module('mean.system');

/**
 * Verifies whether the user has authorization to administer a specific task
 */
app.factory('HasAuthorizationService', ['User', function (User) {
    return function (task) {
        var _identity = User.getIdentity();
        // Make sure identity is defined, an id is set, the user has the authenticated role, and the task has a user set
        if (typeof _identity === 'undefined' || !_identity.hasOwnProperty('_id') ||
            !_identity.hasOwnProperty('roles') || _identity.roles.indexOf('authenticated') === -1 || !task.user) {
            return false;
        }
        return User.isAdmin() || task.user._id === _identity._id;
    };
}]);