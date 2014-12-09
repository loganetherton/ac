'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');
/**
 * Verify that a param expecting an Object ID is indeed a valid Object ID
 * @param id
 * @returns {*}
 */
exports.checkValidObjectId = function (id) {
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Check that the requested team is one in which the user is a member
 */
exports.checkTeam = function (teams, taskTeam) {
    return _.find(teams, function (team) {
        return team + '' === taskTeam + '';
    });
};

/**
 * Create a copy of the original task to save as history
 * @param task
 * @returns {{}}
 */
exports.createTaskHistory = function (task) {
    // Create a snapshot of the task
    var oldTask = {};
    _.forOwn(task._doc, function (value, key) {
        if (key === 'content' || key === 'title' || key === 'user') {
            oldTask[key] = value;
        }
    });
    return oldTask;
};