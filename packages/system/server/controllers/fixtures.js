'use strict';

var mongoose = require('mongoose'),
User = mongoose.model('User'),
Task = mongoose.model('Task');

/**
 * Clear the users collection to implement fixtures
 * @param req
 * @param res
 * @param next
 */
exports.clearUsers = function (req, res, next) {
    User.remove({}, function(err) {
        if (err) {
            console.log('Failed to clear users collection');
            console.log(err);
            return res.status(400);
        } else {
            console.log('Users collection cleared');
            return res.status(200);
        }
    });
};

/**
 * Clear the tasks collection to implement fixtures
 * @param req
 * @param res
 * @param next
 */
exports.clearTasks = function (req, res, next) {
    Task.remove({}, function(err) {
        if (err) {
            console.log('Failed to clear tasks collection');
            console.log(err);
            return res.status(400);
        } else {
            console.log('Tasks collection cleared');
            return res.status(200);
        }
    });
};