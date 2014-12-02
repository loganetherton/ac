'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Task = mongoose.model('Task'),
_ = require('lodash');

/**
 * Verify that a param expecting an Object ID is indeed a valid Object ID
 * @param id
 * @returns {*}
 */
var checkValidObjectId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Check that the requested team is one in which the user is a member
 */
var checkTeam = function (teams, taskTeam) {
    return _.find(teams, function (team) {
        return team + '' === taskTeam + '';
    });
};

/**
 * Create an article
 */
exports.create = function(req, res) {
    var task = new Task(req.body);
    task.user = req.user;
    // Set the team for this task
    task.team = req.user.teams[0];

    task.validate(function (error) {
        if (typeof error !== 'undefined') {
            console.log(error);
        }
    });

    task.save(function(err) {
        if (err) {
            console.log('could not save task to database: ' + err);
            return res.json(500, {
                error: 'Cannot save the task'
            });
        }
        res.json(task);
    });
};

/**
 * Update an task
 */
exports.update = function(req, res) {
    var task = req.task;

    task = _.extend(task, req.body);

    task.save(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot update the task'
            });
        }
        res.json(task);

    });
};

/**
 * Delete an task
 */
exports.destroy = function(req, res) {
    var task = req.task;

    task.remove(function(err) {
        if (err) {
            return res.json(500, {
                error: 'Cannot delete the task'
            });
        }
        res.json(task);

    });
};

/**
 * Get a single task
 */
exports.singleTaskAsJson = function(req, res) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('taskId')) {
        return res.status(400).send('A task ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!checkValidObjectId(req.params.taskId)) {
        return res.status(400).send('Invalid object ID');
    }
    Task.load(req.params.taskId, function (err, task) {
        if (err || !task) {
            return res.send('Failed to load task ' + req.params.taskId);
        }
        // Make sure the requested task is accessible to the requesting user
        if (!checkTeam(req.user.teams, task.team)) {
            return res.status(401).send('Unauthorized');
        }
        res.json(task);
    });
};

/**
 * Get tasks for the current requested user
 */
exports.getTasksByUserId = function(req, res, next) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('userId')) {
        return res.status(400).send('A user ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!checkValidObjectId(req.params.userId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Only allow the user to query their own tasks
    if (req.user._id + '' !== req.params.userId + '') {
        return res.status(400).send('Unauthorized');
    }
    Task.loadByUserId(req.params.userId, function (err, task) {
        if (err) {
            return next(err);
        }
        if (!task) {
            return next(new Error('Failed to load tasks for ' + req.params.userId));
        }
        return res.json(task);
    });
};

/**
 * Retrieve tasks for the requested team
 */
exports.getTasksByTeamId = function (req, res, next) {
    // Make sure a user ID was passed in
    if (!req.params.hasOwnProperty('teamId')) {
        return res.status(400).send('A team ID must be passed in to this query');
    }
    // Check for invalid object ID
    if (!checkValidObjectId(req.params.teamId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Make sure the requesting user is on the team being requested
    if (!checkTeam(req.user.teams, req.params.teamId)) {
        return res.status(401).send('Unauthorized');
    }
    Task.loadByTeamId(req.params.teamId, function (err, tasks) {
        if (err) {
            return next(err);
        }
        if (!tasks) {
            return next(new Error('Failed to load tasks for ' + req.params.teamId));
        }
        return res.json(tasks);
    });
};

/**
 * List of tasks
 */
exports.all = function(req, res) {
    Task.find().sort('-created').populate('user', 'name').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list tasks'
            });
        }
        res.json(tasks);
    });
};

exports.findOne = function (req, res) {
    Task.find().sort('-created').limit(1).populate('user', 'name username').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the tasks'
            });
        }
        res.json(tasks);
    });
};