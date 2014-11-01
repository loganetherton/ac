'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Tasklist = mongoose.model('Tasklist'),
_ = require('lodash');


/**
 * Find article by id
 */
exports.article = function(req, res, next, id) {
    Tasklist.load(id, function(err, article) {
        if (err) return next(err);
        if (!article) return next(new Error('Failed to load article ' + id));
        req.article = article;
        next();
    });
};

/**
 * Create an article
 */
exports.create = function(req, res) {
    var task = new Tasklist(req.body);
    task.user = req.user;

    task.save(function(err) {
        if (err) {
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
 * Show an task
 */
exports.show = function(req, res) {
    res.json(req.task);
};

/**
 * List of tasks
 */
exports.all = function(req, res) {
    Tasklist.find().sort('-created').populate('user', 'name username').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the tasks'
            });
        }
        res.json(tasks);
    });
};

exports.findOne = function (req, res) {
    Tasklist.find().sort('-created').limit(1).populate('user', 'name username').exec(function(err, tasks) {
        if (err) {
            return res.json(500, {
                error: 'Cannot list the tasks'
            });
        }
        console.log(tasks);
        res.json(tasks);
    });
};