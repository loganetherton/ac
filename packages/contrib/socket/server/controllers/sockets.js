'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Message = mongoose.model('Message'),
  _ = require('lodash');

exports.createFromSocket = function(data, cb) {
  console.log(data);
  var message = new Message(data.message);
  message.user = data.user._id;
  message.time = new Date();
  message.save(function(err) {
    if (err) console.log(err);
    Message.findOne({
      _id: message._id
    }).populate('user', 'name username').exec(function(err, message) {
      return cb(message);
    });
  });
};

exports.getAllForSocket = function(channel, cb) {
  Message.find({
    channel: channel
  }).sort('time').populate('user', 'name username').exec(function(err, messages) {
    return cb(messages);
  });
};

exports.getListOfChannels = function(cb) {
  Message.distinct('channel', {}, function(err, channels) {
    console.log('channels', channels);
    return cb(channels);
  });
};
