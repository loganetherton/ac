'use strict';

var app = angular.module('mean.users');

app.factory('User', ['$rootScope', function ($rootScope) {
    var identity;

    return {
        get identity() {
            return identity;
        },
        set identity(user) {
            this.setIdentity(user);
        },
        setIdentity: function (user) {
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = user;
            identity = user;
        }
    };
}]);