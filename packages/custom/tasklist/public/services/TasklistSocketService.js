/*global io:false */
'use strict';

var app = angular.module('mean.tasklist');

app.factory('TasklistSocketService', ['$rootScope', 'AcSocketService', function ($rootScope, AcSocketService) {
    var socket = io.connect('http://localhost:3000/task');
    // Inherit from parent
    var tasklistSocket = Object.create(AcSocketService);
    // Set the socket to this one
    tasklistSocket.getSocket = function () {
        return socket;
    };
    return tasklistSocket;
}]);