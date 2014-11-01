/*global io:false */
'use strict';

var app = angular.module('mean.tasklist');

var baseUrl = 'http://localhost:8282/';

app.factory('MeanSocket', ['$rootScope', '$resource', function ($rootScope, $resource) {
    var socket = io.connect(baseUrl);
    return {
        init: function () {
            socket.removeAllListeners();
        },
        on: function(eventName, callback) {
            socket.on(eventName, function() {
                var args = arguments;
                $rootScope.$apply(function() {
                    callback.apply(socket, args);
                });
            });
        },
        emit: function(eventName, data, callback) {
            socket.emit(eventName, data, function() {
                console.log('event:', eventName);
                var args = arguments;
                $rootScope.$apply(function() {
                    if (callback) {
                        callback.apply(socket, args);
                    }
                });
            });
        }
    };
}]);