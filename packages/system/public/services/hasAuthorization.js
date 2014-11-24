'use strict';

var app = angular.module('mean.system');

/**
 * Verifies whether the user has authorization to administer a specific task
 */
app.factory('HasAuthorizationService', ['User', function (User) {
    return function (task) {
        if (typeof User.getIdentity() === 'undefined' || !User.getIdentity().hasOwnProperty('_id') || !task.user) {
            return false;
        }
        return User.isAdmin || task.user._id === User.getIdentity()._id;
    };
}]);