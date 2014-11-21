'use strict';

var app = angular.module('mean.users');

app.factory('User', ['$rootScope', function ($rootScope) {
    var identity;

    return {
        get identity() {
            return identity;
        },
        set identity(val) {
            identity = val;
            // Make accessible to rootScope (this will eventually be removed)
            $rootScope.user = val;
        }
    };
}]);