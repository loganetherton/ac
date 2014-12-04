'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Task = mongoose.model('Task');

/**
 * Retrieve the five most recent tasks for the user
 * @param req
 * @param res
 */
exports.findMostRecent = function (req, res) {
    // Pagination
    var page = req.params.page || 1;
    Task.getMostRecent(req.user._id, 5, page, function (err, tasks) {
        if (err) {
            return res.status(500).send('Could not retrieve list of tasks');
        }
        res.json(tasks);
    });
};