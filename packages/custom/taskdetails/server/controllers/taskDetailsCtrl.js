'use strict';

var mongoose = require('mongoose'),
    Task = mongoose.model('Task');

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