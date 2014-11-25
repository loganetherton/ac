'use strict';

var app = angular.module('mean.users');

/**
 * I'm going to leave identity as a private property, accessible only via the
 * fake getter and setter functions to maintain object integrity
 */
app.factory('User', ['$rootScope', function ($rootScope) {
    var identity = window.user;
    identity.authenticated = false;
    identity.isAdmin = false;

    if (window.user && window.user.roles) {
        identity.authenticated = window.user.roles.length;
        identity.isAdmin = window.user.roles.indexOf('admin') !== -1;
    }

    return {
        /**
         * Karma dies every time when a service has getter/setters. Pretty poor.
         */
        isAdmin: false,
        getIdentity: function () {
            return identity;
        },
        setIdentity: function (user) {
            var userObj = this;
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = user;
            identity = user;
            if ('roles' in user && angular.isArray(user.roles) && user.roles.indexOf('admin') !== -1) {
                userObj.isAdmin = true;
            }
        }
    };
}]);