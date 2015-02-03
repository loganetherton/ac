'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash');
/**
 * Verify that a param expecting an Object ID is indeed a valid Object ID
 * @param id
 * @returns {*}
 */
exports.checkValidObjectId = function (id) {
    // If we're passing in an ID right from the db, check that it's valid that way
    if (typeof id === 'object' && id.hasOwnProperty('_bsontype')) {
        return id._bsontype === 'ObjectID';
    }
    // Otherwise, go through the mongoose regex (^[0-9a-fA-F]{24}$)
    return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Check to see if a string is in fact an RFC4122 UUID
 * @param id
 * @returns {*|Boolean|SchemaType|Array|{index: number, input: string}}
 */
exports.checkValidUUID = function (id) {
    return id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/);
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