'use strict';

var app = angular.module('mean.users');

/**
 * I'm going to leave identity as a private property, accessible only via the
 * fake getter and setter functions to maintain object integrity
 */
app.factory('User', ['$rootScope', '$state', function ($rootScope, $state) {
    // Initialize the user identity on service creation
    var _identity = window.user;
    _identity.authenticated = false;
    _identity.isAdmin = false;

    if (window.user && window.user.roles) {
        _identity.authenticated = window.user.roles.length;
        _identity.isAdmin = window.user.roles.indexOf('admin') !== -1;
    }

    //$rootScope.$watch(function () {
    //    return _identity;
    //}, function (newVal) {
    //    $state.go('site.tasklist');
    //});

    return {
        /**
         * Karma dies every time when a service has getter/setters. Pretty poor.
         */
        isAdmin: function () {
            return _identity.roles.indexOf('admin') !== -1;
        },
        getIdentity: function () {
            return _identity;
        },
        setIdentity: function (user) {
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = user;
            _identity = user;
            // Set authenticated, and admin if applicable
            if (user && 'roles' in user && angular.isArray(user.roles) && user.roles.indexOf('authenticated') !== -1) {
                _identity.authenticated = true;
                if (user.roles.indexOf('admin') !== -1) {
                    _identity.isAdmin = true;
                }
            }
        }
    };
}]);