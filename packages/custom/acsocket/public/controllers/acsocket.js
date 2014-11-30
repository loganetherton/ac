'use strict';

angular.module('mean.acsocket').controller('AcSocketController',
['$scope', 'Global', 'AcSocketService', function ($scope, Global, AcSocketService) {
    $scope.global = Global;

    // Clear the message input after sending the message
    $scope.socketAfterSend = function () {
        $scope.message = {};
    };

    // After joining, set the active channel and get messages
    $scope.socketAfterJoin = function (channel, messages) {
        console.log('socketAfterJoin acSocket');
        $scope.activeChannel = channel;
        $scope.messages = messages;
    };

    // After receiving a message, push it onto messages array
    $scope.socketAfterGet = function (message) {
        $scope.messages.push(message);
    };

    $scope.socketAfterGetChannels = function (channels) {
        $scope.channels = channels;
    };

    // After creating a channel, join it and clear channel input
    $scope.createNewChannel = function (channel) {
        console.log('acSocket createNewChannel: ' + channel);
        $scope.activeChannel = channel;
        $scope.newChannel = '';
    };
}]);
