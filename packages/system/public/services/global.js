'use strict';

//Global service for global variables
angular.module('mean.system').factory('Global', [function () {
    var _this = this;
    _this._data = {
        user: window.user,
        authenticated: false,
        isAdmin: false
    };
    if (window.user && window.user.roles) {
        _this._data.authenticated = window.user.roles.length;
        _this._data.isAdmin = window.user.roles.indexOf('admin') !== -1;
    }

    // Tasklist module, global strings
    _this._data.tasklist = {};
    _this._data.tasklist.strings = {
        name: 'Task list',
        project: 'Setting up'
    };
    return _this._data;
}]);