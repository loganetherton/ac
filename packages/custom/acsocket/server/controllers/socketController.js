'use strict';

var mongoose = require('mongoose'),
    Message = mongoose.model('acMessage');

// Create a new message, queries it from the db and returned it with populated values
// Todo this is badly inefficient, needs revision. No need for multiple queries...
exports.createFromSocket = function (data, cb) {
    var message = new Message(data.message);
    message.user = data.user._id;
    message.time = new Date();
    message.save(function (err) {
        if (err) {
            console.log(err);
        }
        Message.findOne({
            _id: message._id
        }).populate('user', 'name').exec(function (err, message) {
            return cb(message);
        });
    });
};

// Find all messages for the socket
exports.getAllForSocket = function (channel, cb) {
    Message.find({
        channel: channel
    }).sort('time').populate('user', 'name').exec(function (err, messages) {
        return cb(messages);
    });
};

// Get a list of all channels
exports.getListOfChannels = function (cb) {
    Message.distinct('channel', {}, function (err, channels) {
        return cb(channels);
    });
};