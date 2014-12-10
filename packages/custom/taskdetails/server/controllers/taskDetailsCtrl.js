'use strict';

var mongoose = require('mongoose'),
    Task = mongoose.model('Task'),
    _ = require('lodash');

var serverCtrlHelpers = require('../../../../system/server/controllers/helpers');

/**
 * Get a single task
 */
exports.singleTaskAsJson = function(req, res) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('taskId')) {
        return res.status(400).send('A task ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!serverCtrlHelpers.checkValidObjectId(req.params.taskId)) {
        return res.status(400).send('Invalid object ID');
    }
    Task.load(req.params.taskId, function (err, task) {
        if (err || !task) {
            return res.send('Failed to load task ' + req.params.taskId);
        }
        // Make sure the requested task is accessible to the requesting user
        if (!serverCtrlHelpers.checkTeam(req.user.teams, task.team)) {
            return res.status(401).send('Unauthorized');
        }
        res.json(task);
    });
};

/**
 * Check if any updates have been made to the task
 * @param req
 * @param task
 * @returns {*}
 */
var taskUpdated = function (req, task) {
    return _.isEqual(req.user._id, task.user._id) && _.isEqual(task.title, req.body.title) &&
           _.isEqual(task.content, req.body.content);
};

/**
 * Update a single task
 * @param req
 * @param res
 * @returns {*}
 */
exports.updateTask = function (req, res) {
    if (_.isUndefined(req.params.taskId) || !serverCtrlHelpers.checkValidObjectId(req.params.taskId)) {
        return res.status(400).send('A valid task ID must be passed in to this query');
    }
    Task.load(req.params.taskId, function (err, task) {
        if (err || !task) {
            return res.status(400).send('Failed to load task ' + req.params.taskId);
        }
        // Make sure the requested task is accessible to the requesting user
        if (!serverCtrlHelpers.checkTeam(req.user.teams, task.team)) {
            return res.status(401).send('Unauthorized');
        }
        // if nothing changes, do nothing
        if (taskUpdated(req, task)) {
            return res.json(task);
        }
        // Create a snapshot of this point
        var oldTask = serverCtrlHelpers.createTaskHistory(task);
        // Update title
        if (_.isString(req.body.title)) {
            task.title = req.body.title;
        }
        // Update content
        if (_.isString(req.body.content)) {
            task.content = req.body.content;
        }
        // Insert the history item
        task.history.push(oldTask);
        // Save the new task
        task.save(function (err) {
            if (err) {
                return res.status(400).send('Failed to update task ' + req.params.taskId);
            }
            res.json(task);
        });
    });
};