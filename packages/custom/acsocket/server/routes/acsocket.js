'use strict';

// The Package is past automatically as first parameter
module.exports = function(Acsocket, io) {

    var _ = require('lodash');
    var moment = require('moment');
    var socketController = require('../controllers/socketController');

    var channelWatchList = [];

    // Connection to socket
    io.on('connection', function (socket) {
        console.log('User connected to socket');

        // Socket disconnect
        socket.on('disconnect', function () {
            console.log('Use disconnected from socket');
        });

        // User joins this room
        socket.on('user:joined', function (user) {
            console.log(user.name + ' has joined');
            io.emit('user:joined', {
                message: user.name + ' has joined the room',
                time: moment(),
                expires: moment().add(10)
            });
        });

        socket.on('message:send', function (message) {
            socketController.createFromSocket(message, function (cb) {
                io.emit('message:channel:' + message.channel, cb);
            });
        });

        // On joining the channel
        socket.on('channel:join', function (channelInfo) {
            console.log('Channel joined: ' + channelInfo.channel);
            console.log(channelInfo);
            // Add this channel to the array of channels if necessary
            if (channelWatchList.indexOf(channelInfo.channel) !== -1) {
                channelWatchList.push(channelInfo.channel);
            }

            // Emit the channel join with channelInfo
            io.emit('user:channel:joined:' + channelInfo.channel, {
                message: channelInfo
            });

            // Get list of channels, update if new channel
            socketController.getListOfChannels(function (channels) {
                _.each(channels, function (chan) {
                    // If the channel is not currently in the list of channels, add it
                    if (channelWatchList.indexOf(chan) !== -1) {
                        channelWatchList.push(chan);
                    }
                });

                // Emit new list of channels
                socket.emit('channels', channelWatchList);
            });

            // Get messages which haven't yet expired for this channel
            socketController.getAllForSocket(channelInfo.channel, function (data) {
                console.log('received messages');
                socket.emit('messages:channel:' + channelInfo.channel, data);
            })
        });
    });
};
