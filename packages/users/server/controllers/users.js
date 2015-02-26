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
    Message = mongoose.model('Message'),
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
 * Create user
 */
exports.createAsync = function (req, res, next) {
    // Create user
    var user = new User(req.body);
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
            return res.status(400).send(err.msg);
        }
        // Push this user's team
        user.teams.push(team._id);
        var teamOnSession = '';
        session = req.session;
        // Get the team to which this user was invited
        if (req.session.hasOwnProperty('invitedTeams') && req.session.invitedTeams.length) {
            teamOnSession = req.session.invitedTeams[0].teamId;
        }
        // Check to make sure the team exists
        serverCtrlHelpers.checkTeamExists(teamOnSession)
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
        .then(serverCtrlHelpers.removeAcceptedInviteFromInviter)
        // Remove invites from session
        .then(function () {
            return serverCtrlHelpers.removeInviteFromSession(session);
        })
        // Save the new user
        .then(function (thisSession) {
            // Write the session back for saving
            session = thisSession;
            user.save(function (err) {
                if (err) {
                    // @TODO Roll back user creation
                    return res.status(400).send(err);
                }
                // Log the user in
                req.logIn(user, function (err) {
                    if (err) {
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
        return serverCtrlHelpers.checkRegistrationCode(req.body.regCode)
        .then(function (response) {
            // Return expired for expired invites
            if (response.status === 'expired') {
                return res.send({
                    inviteStatus: 'expired'
                });
            }
            // Make sure a valid team was returned before continuing
            if(response.status === 'valid' && serverCtrlHelpers.checkValidObjectId(response.teamId)) {
                return serverCtrlHelpers.checkTeamExists(response.teamId).then(function () {
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
        })
        .catch(function (err) {
            return res.status(400).send(err);
        });
    }
    // Nothing written
    return res.status(400).send('');
};

/**
 * Search for existing users to add to team
 * @param req
 * @param res
 * @returns {*}
 */
exports.userSearch = function (req, res) {
    req.assert('searchTerm', 'Query must be between 3 and 100 characters').len(3, 100);
    var validationErrors = req.validationErrors();
    // Send back any errors
    if (validationErrors) {
        return res.status(400).json(validationErrors);
    }
    var regex = new RegExp(req.params.searchTerm, 'i');
    // Find user based on name regex
    User
    .find({})
    // Search by name or email
    .or([{email: {$regex: regex}}, {name: {$regex: regex}}])
    .sort('_id')
    // Just return the name
    .select('name email')
    // Don't include the current user in the result set
    .ne('name', req.user.name)
    .ne('email', req.user.email)
    // Make sure that the user's returned aren't on this user's team already
    .nin('teams', req.user.teams)
    .exec(function (err, users) {
        // Stop on error
        if (err) {
            throw Error(err.message);
        }
        // Return name as name <email>
        users = users.map(function (user) {
            user.name = user.name + ' <' + user.email + '>';
            return user;
        });
        // Return all found users
        return res.status(200).json(users);
    });
};

/**
 * Get messages for this user
 * @param req
 * @param res
 * @param next
 */
exports.getMessages = function (req, res, next) {
    // Get messages for this user
    Message.find({
        user: req.user._id
    }, function (err, messages) {
        if (err) {
            return next(err);
        }
        // If no messages, return that nice message
        if (!messages.length) {
            return res.status(200).send('No messages');
        }
        // Send messages, if any are found
        return res.status(200).json(messages);
    });
};

/**
 * Send a message to a user
 * @param req
 * @param res
 * @param next
 */
exports.sendMessage = function (req, res, next) {
    var message;
    // Make sure user and message included
    if (!req.body.hasOwnProperty('message') || !req.body.hasOwnProperty('user')) {
        return res.status(400).send('A user and a message must be specified');
    }
    message = new Message(req.body);
    message.save(function (err) {
        // Error handling, eventually
        if (err) {
            return next(Error(err));
        }
        res.status(200).send('Message sent');
    });
};