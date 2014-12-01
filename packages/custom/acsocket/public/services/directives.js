'use strict';

var app = angular.module('mean.acsocket');

app.directive('sendMessage', ['AcSocketService', 'Global', 'User', function (AcSocketService, Global, User) {
    return {
        restrict: 'A',
        //replace: true,
        scope: {
            message: '=',
            afterSend: '&'
        },
        template: '<button class="btn btn-info" data-ng-click="sendMessage(message)">Send</button>',
        link: function (scope, element, attr) {

            scope.global = Global;

            // Send a new message
            scope.sendMessage = function (message) {
                // Check for valid message
                if (!message || message === null || typeof message === 'undefined' || message.length === 0) {
                    return;
                }
                // Emit the new message
                AcSocketService.emit('message:send', {
                    message: message,
                    user: scope.global.user,
                    channel: AcSocketService.activeChannel
                });
                scope.afterSend()(message);
                //scope.afterSend({
                //    message: message
                //});
            };
        }
    };
}]);

// Establish the socket connection
app.directive('useAcSocket', ['Global', 'AcSocketService', function (Global, AcSocketService) {
    return {
        restrict: 'E',
        scope: {
            joinToChannel: '=',
            afterJoin: '&',
            socketAfterGet: '&',
            socketAfterGetAllChannels: '&'
        },
        link: function (scope, element, attr) {
            scope.global = Global;

            scope.channel = {
                name: ''
            };

            scope.listeningChannels = [];

            // Listen for channels, set channels into scope
            AcSocketService.on('channels', function (channels) {
                scope.socketAfterGetAllChannels({
                    channels: channels
                });
            });

            // Emit the new user on join
            AcSocketService.emit('user:joined', {
                user: scope.global.user._id
            });

            // Listener for a user joining
            AcSocketService.on('user:joined', function (user) {

            });

            // Channel listeners
            scope.listenChannel = function (channel) {
                // Listen for users joining a channel
                AcSocketService.on('user:channel:joined:' + channel, function (user) {
                    console.log('user joined ' + channel);
                });
                // On channel messages emit
                AcSocketService.on('messages:channel:' + channel, function (messages) {
                    AcSocketService.activeChannel = channel;
                    scope.afterJoin({
                        messages: messages,
                        channel: channel
                    });
                });
                // On channel message emit (single message)
                AcSocketService.on('message:channel:' + channel, function (message) {
                    if (channel === AcSocketService.activeChannel) {
                        scope.socketAfterGet({
                            message: message
                        });
                    }
                });
                // Add the channel to channels array
                if (scope.listeningChannels.indexOf(channel) === -1) {
                    scope.listeningChannels.push(channel);
                }
            };

            // Channel join
            scope.joinChannel = function (channel) {
                // Listen to channel
                if (scope.listeningChannels.indexOf(channel) === -1) {
                    scope.listenChannel(channel);
                }

                AcSocketService.emit('channel:join', {
                    channel: channel,
                    name: scope.global.user._id
                });
            };

            scope.joinChannel('mean');

            // Watch joinToChannel
            scope.$watch('joinToChannel', function () {
                if (scope.joinToChannel) {
                    scope.joinChannel(scope.joinToChannel);
                }
            });
        }
    };
}]);