'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    User = mongoose.model('User'),
    async = require('async'),
    config = require('meanio').loadConfig(),
    crypto = require('crypto'),
    nodemailer = require('nodemailer'),
    templates = require('../template'),
    Team = mongoose.model('Team'),
    q = require('q'),
    _ = require('lodash'),
    Promise = require('bluebird');

var serverCtrlHelpers = require('../../../system/server/controllers/helpers');

var session,
    // Hold reference to the invite on the user's session
    inviteOnSession = {};

/**
 * Redirect to app as signed in user after SSO
 */
exports.authCallback = function (req, res) {
    res.redirect('/');
};

/**
 * Redirect back to login form after SSO failure
 */
exports.signin = function (req, res) {
    if (req.isAuthenticated()) {
        return res.redirect('/');
    }
    res.redirect('#!/login');
};

/**
 * Logout and redirect
 */
exports.signout = function (req, res) {
    req.logout();
    res.redirect('/');
};

/**
 * Check the registration code on sign up and see if this user needs to be added to any teams
 * @param regCode
 */
var checkRegistrationCode = function (regCode) {
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
                if (!user) {
                    return resolve('No matching invite');
                }
                // If a user was found by the invite string, find out which team to add this user to
                user.invites.forEach(function (invite) {
                    // Add this user to the team for which they were invited
                    if (invite.inviteString === regCode) {
                        // If the invite is still valid, proceed
                        if (invite.expires > new Date()) {
                            return resolve({
                                teamId: invite.teamId,
                                inviteCode: regCode,
                                status: 'valid'
                            });
                        }
                        return resolve({
                            status: 'expired'
                        });
                    }
                });
                resolve('No matching invite');
            });
        }
    });
};

/**
 * Remove the invitation from the inviting user's record once it has been accepted
 * @param response Response from adding team to record of user being created now
 * @returns {bluebird}
 */
var removeAcceptedInviteFromInviter = function (response) {
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
var removeInviteFromSession = function () {
    return new Promise(function (resolve, reject) {
        // Remove invites
        session.invitedTeams = [];
        resolve();
    });
};

/**
 * Create user
 */
exports.createAsync = function (req, res, next) {
    // Create user
    var user = new User(req.body.user);
    var team = new Team({
        name: user.name + '\'s Team'
    });

    user.provider = 'local';
    // Because we set our user.provider to local our models/user.js validation will always be true
    req.assert('user.name', 'You must enter a name').notEmpty();
    req.assert('user.email', 'You must enter a valid email address').isEmail();
    req.assert('user.password', 'You must enter a password').notEmpty();
    req.assert('user.password', 'Password must be between 8-100 characters long').len(8, 100);
    // Return errors if there were any
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors[0].msg);
    }
    // Create the team, then add the user to the team
    team.save(function (err) {
        if (err) {
            return res.status(400).send(errors[0].msg);
        }
        // Push this user's team
        user.teams.push(team._id);
        var teamOnSession = '';
        session = req.session;
        // Get the team to which this user was invited
        if (req.session.hasOwnProperty('invitedTeams')) {
            teamOnSession = req.session.invitedTeams[0].teamId;
        }
        // Check to make sure the team exists
        checkTeamExists(teamOnSession)
        .then(function (teamId) {
            return new Promise(function (resolve, reject) {
                // Add the user to the team
                if (teamId) {
                    user.teams.push(teamId);
                    inviteOnSession.teamId = teamId;
                    inviteOnSession.inviteCode = req.session.invitedTeams[0].inviteCode;
                    return resolve({
                        addedToTeam: true,
                        inviteCode: req.session.invitedTeams[0].inviteCode
                    });
                }
                return resolve({
                    addedToTeam: false
                });
            });
        })
        // Remove the accepted invite from the inviting user's record
        .then(removeAcceptedInviteFromInviter)
        // Remove invites from session
        .then(removeInviteFromSession)
        // Save the new user
        .then(function () {
            user.save(function (err) {
                if (err) {
                    res.status(400).send(err);
                }
                // Log the user in
                req.logIn(user, function (err) {
                    if (err) {
                        console.log('error logging in');
                        return next(err);
                    }
                    return res.send({
                        user: req.user,
                        redirectState: 'site.tasklist'
                    });
                });
            });
        }).catch(function (err) {
            // @TODO Undo all of the stuff that happened above on error
            res.status(400).json(err);
        });
    });
};

/**
 * Helper function to check invites on the current user's session
 * @param req
 * @param res
 * @returns {*}
 */
exports.checkInvitesOnSession = function (req, res) {
    if (req.session.hasOwnProperty('invitedTeams') && req.session.invitedTeams.length) {
        return res.json({
            invites: req.session.invitedTeams[0].teamId
        });
    }
    return res.json({
        invites: false
    });
};

/**
 * Get the current user (for exporting onto global object)
 */
exports.me = function (req, res) {
    var user = null;
    // Save the users teams into the session
    if (req.user) {
        req.session.teams = req.user.teams;
        user = req.user;
    }
    res.json(user);
};

/**
 * Find user by id
 */
exports.user = function (req, res, next, id) {
    User.findOne({
        _id: id
    }).exec(function (err, user) {
        if (err) {
            return next(err);
        }
        if (!user) {
            return next(new Error('Failed to load User ' + id));
        }
        req.profile = user;
        next();
    });
};

/**
 * Resets the password
 */
exports.resetpassword = function (req, res, next) {
    // Get the reset password token that matches this user
    User.findOne({
        resetPasswordToken: req.params.token, resetPasswordExpires: {
            $gt: Date.now()
        }
    }, function (err, user) {
        if (err) {
            return res.status(400).json({
                msg: err
            });
        }
        // If none was found, return error
        if (!user) {
            return res.status(400).json({
                msg: 'Token invalid or expired'
            });
        }
        req.assert('password', 'Password must be between 8-20 characters long').len(8, 20);
        // Check any additional errors
        var errors = req.validationErrors();
        if (errors) {
            return res.status(400).send(errors);
        }
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Save new information
        user.save(function (err) {
            if (err) {
                return next(err);
            }
            // Log the user in
            req.logIn(user, function (err) {
                if (err) {
                    return next(err);
                }
                return res.send({
                    user: user,
                });
            });
        });
    });
};

/**
 * Send reset password email
 */
function sendMail(mailOptions) {
    var transport = nodemailer.createTransport(config.mailer);
    transport.sendMail(mailOptions, function (err, response) {
        if (err) {
            return err;
        }
        return response;
    });
}

/**
 * Callback for forgot password link
 */
exports.forgotpassword = function (req, res, next) {
    // Execute in a series
    async.waterfall([
        function (done) {
            crypto.randomBytes(20, function (err, buf) {
                var token = buf.toString('hex');
                done(err, token);
            });
        }, function (token, done) {
            User.findOne({
                $or: [{
                          email: req.body.text
                      }, {
                          username: req.body.text
                      }]
            }, function (err, user) {
                if (err || !user) {
                    return done(true);
                }
                done(err, user, token);
            });
        }, function (user, token, done) {
            user.resetPasswordToken = token;
            user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
            user.save(function (err) {
                done(err, token, user);
            });
        }, function (token, user, done) {
            var mailOptions = {
                to: user.email, from: config.emailFrom
            };
            mailOptions = templates.forgot_password_email(user, req, token, mailOptions);
            sendMail(mailOptions);
            done(null, true);
        }], function (err, status) {
        var response = {
            message: 'Mail successfully sent', status: 'success'
        };
        if (err) {
            response.message = 'User does not exist';
            response.status = 'danger';
        }
        res.json(response);
    });
};

/**
 * Session (not entirely sure what this does - remove?)
 */
exports.session = function (req, res) {
    res.redirect('/');
};

/**
 * Check to see if a team exists by ID
 * @param teamId
 * @returns {bluebird}
 */
var checkTeamExists = function (teamId) {
    return new Promise(function (resolve, reject) {
        if (!teamId) {
            return resolve();
        }
        Team.findOne({
            _id: teamId
        }, function (err, team) {
            if (err) {
                return false;
            }
            if (team) {
                return resolve(teamId);
            } else {
                resolve();
            }
        });
    });
};

/**
 * When a valid object ID is passed in, write it to session (it won't matter if it's an invalid
 * team, since the user won't be added to an invalid team)
 * @param req
 * @param res
 */
exports.writeInviteToSession = function (req, res) {
    // If no team ID is passed in, return nothing
    if (!req.body.hasOwnProperty('regCode')) {
        return res.send('');
    }
    // if this is a valid object ID, see if it's already on the session
    if (serverCtrlHelpers.checkValidUUID(req.body.regCode)) {
        // Check to make sure that this invite string actually exists
        return checkRegistrationCode(req.body.regCode).then(function (response) {
            // Return expired for expired invites
            if (response.status === 'expired') {
                return res.send({
                    inviteStatus: 'expired'
                });
            }
            // Make sure a valid team was returned before continuing
            if(response.status === 'valid' && serverCtrlHelpers.checkValidObjectId(response.teamId)) {
                return checkTeamExists(response.teamId).then(function () {
                    // Save the invited team to session
                    req.session.invitedTeams = [
                        {
                            teamId: response.teamId,
                            inviteCode: response.inviteCode
                        }
                    ];
                    // Added this team to session
                    return res.json({
                        invitedTeams: req.session.invitedTeams
                    });
                });
            }
            return res.status(400).send('');
        }).catch(function (err) {
            return res.status(400).send(err);
        });
    }
    // Nothing written
    return res.status(400).send('');
};