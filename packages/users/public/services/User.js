'use strict';

var app = angular.module('mean.users');

/**
 * I'm going to leave identity as a private property, accessible only via the
 * fake getter and setter functions to maintain object integrity
 */
app.factory('User', ['$rootScope', function ($rootScope) {
    // Initialize the user identity on service creation
    var _identity = window.user;
    _identity.authenticated = false;
    _identity.isAdmin = false;

    if (window.user && window.user.roles) {
        _identity.authenticated = window.user.roles.length;
        _identity.isAdmin = window.user.roles.indexOf('admin') !== -1;
    }

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
            var userObj = this;
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = user;
            _identity = user;
            if (_identity && 'roles' in _identity && angular.isArray(_identity.roles) &&
                _identity.roles.indexOf('admin') !== -1)
            {
                userObj.isAdmin = true;
            }
        }
    };
}]);