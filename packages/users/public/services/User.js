'use strict';

var app = angular.module('mean.users');

app.factory('User', [function () {
    var identity;

    return {
        get identity() {
            return identity;
        },
        set identity(val) {
            identity = val;
        }
    };
}]);