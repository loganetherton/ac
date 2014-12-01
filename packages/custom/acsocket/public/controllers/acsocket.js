'use strict';

angular.module('mean.acsocket').controller('AcSocketController',
['$scope', 'Global', 'AcSocketService', function ($scope, Global, AcSocketService) {
    var vm = this;
    vm.global = Global;

    // Clear the message input after sending the message
    vm.socketAfterSend = function (message) {
        console.log('socketAfterSend message: ' + message);
        vm.message = {};
    };

    // After joining, set the active channel and get messages
    vm.socketAfterJoin = function (channel, messages) {
        vm.activeChannel = channel;
        vm.messages = messages;
    };

    // After receiving a message, push it onto messages array
    vm.socketAfterGet = function (message) {
        vm.messages.push(message);
    };

    vm.socketAfterGetChannels = function (channels) {
        vm.channels = channels;
    };

    // After creating a channel, join it and clear channel input
    vm.createNewChannel = function (channel) {
        vm.activeChannel = channel;
        vm.newChannel = '';
    };
}]);
