'use strict';

// The Package is past automatically as first parameter
module.exports = function(MeanSocket, io) {

    var _ = require('lodash');
    var moment = require('moment');
    var mycontroller = require('../controllers/sockets');

    var channelWatchList = [];

    io.on('connection', function(socket) {

        console.log('Chat - user connected');
        
        /**
         * disconnect
         */
        socket.on('disconnect', function() {
            console.log('Chat - user disconnected');
        });

        /**
         * user:joined
         */
        socket.on('user:joined', function(user) {
            console.log(user.name + ' joined the room');
            var message = user.name + ' joined the room';
            io.emit('user:joined', {
                message: message,
                time: moment(),
                expires: moment().add(10)
            });
        });

        /**
         * message:send
         */
        socket.on('message:send', function(message) {
            console.log('message: ' + message);
            console.log(JSON.stringify(message));

            console.log('storing to set: messages:' + message.channel);

            mycontroller.createFromSocket(message, function(cb) {
                io.emit('message:channel:' + message.channel, cb);
                console.log('emited: ' + cb);
            });
        });

        /**
         * channel:join
         */
        socket.on('channel:join', function(channelInfo) {
            console.log('Channel joined - ', channelInfo.channel);
            console.log(channelInfo);
            console.log('Added to channels: ', channelInfo.channel);
            console.log('messages:' + channelInfo.channel);

            if (channelWatchList.indexOf(channelInfo.channel) === -1) {
                channelWatchList.push(channelInfo.channel);
            }

            io.emit('user:channel:joined:' + channelInfo.channel, {
                message: channelInfo,
            });

            mycontroller.getListOfChannels(function(channels) {
                _.each(channels, function(c) {
                  if (channelWatchList.indexOf(c) === -1) {
                      channelWatchList.push(c);
                  }
                });
                console.log('Emitting2', 'channels', channelWatchList);
                socket.emit('channels', channelWatchList);
            });

            //Emit back any messages that havent expired yet.
            mycontroller.getAllForSocket(channelInfo.channel, function(data) {
                console.log('got messages');
                socket.emit('messages:channel:' + channelInfo.channel, data);
            });
        });

    });
};
