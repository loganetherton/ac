'use strict';

var mongoose = require('mongoose'),
    _ = require('lodash'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    Promise = require('bluebird');
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

/**
 * Check to see if a team exists by ID
 * @param teamId
 * @returns {bluebird}
 */
exports.checkTeamExists = function (teamId) {
    return new Promise(function (resolve, reject) {
        if (!teamId) {
            return resolve();
        }
        Team.findOne({
            _id: teamId
        }, function (err, team) {
            if (err) {
                return reject();
            }
            // Resolve with team id
            if (team) {
                return resolve(teamId);
            } else {
                resolve();
            }
        });
    });
};

/**
 * Remove the invitation from the inviting user's record once it has been accepted
 * @param response Response from adding team to record of user being created now
 * @returns {bluebird}
 */
var removeAcceptedInviteFromInviter = exports.removeAcceptedInviteFromInviter = function (response) {
    return new Promise(function (resolve, reject) {
        if (response.addedToTeam) {
            // Find the user that sent the invite and remove it from their record
            User.findByInviteCode(response.inviteCode, function (err, invitingUser) {
                if (err) {
                    reject(err);
                }
                // It'll be on there, just double checking for some reason
                if (invitingUser.invites.length) {
                    // Find invite and remove it
                    invitingUser.invites = invitingUser.invites.map(function (invite) {
                        if (invite.inviteString.toString() === response.inviteCode.toString()) {
                            return null;
                        }
                        return invite;
                    }).filter(function (invite) {
                        return invite;
                    });
                    // Save the user after removing the invite
                    invitingUser.save(function (err) {
                        if (err) {
                            return reject(err);
                        }
                        return resolve();
                    });
                }
            });
        } else {
            resolve();
        }
    });
};

/**
 * Remove invitations from the user's session after they have responded to it affirmatively
 * @returns {bluebird}
 */
exports.removeInviteFromSession = function (session) {
    return new Promise(function (resolve, reject) {
        // Remove invites
        session.invitedTeams = [];
        resolve(session);
    });
};

/**
 * Check the registration code on sign up and see if this user needs to be added to any teams
 * @param regCode
 */
exports.checkRegistrationCode = function (regCode) {
    var noMatch = true;
    return new Promise(function (resolve, reject) {
        // If no reg code, continue
        if (!regCode) {
            resolve('No invite');
        } else {
            // Find the user that did the inviting
            User.findByInviteCode(regCode, function (err, user) {
                if (err) {
                    return reject('Error finding user by invite');
                }
                // If we didn't find anything that matched, return
                if (user === null) {
                    return resolve('No matching invite');
                }
                // If a user was found by the invite string, find out which team to add this user to
                user.invites.forEach(function (invite) {
                    // Add this user to the team for which they were invited
                    if (invite.inviteString === regCode) {
                        noMatch = false;
                        // If the invite is still valid, proceed
                        if (invite.expires > new Date()) {
                            return resolve({
                                teamId: invite.teamId,
                                inviteCode: regCode,
                                status: 'valid'
                            });
                        } else {
                            return removeAcceptedInviteFromInviter({
                                addedToTeam: true,
                                inviteCode: regCode
                            }).then(function () {
                                return resolve({
                                    status: 'expired'
                                });
                            });
                        }
                    }
                });
                // No match found
                if (noMatch) {
                    resolve('No matching invite');
                }
            });
        }
    });
};