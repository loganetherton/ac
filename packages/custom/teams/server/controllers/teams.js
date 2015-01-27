/*global process:false */
'use strict';

var mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    nodeMailer = require('nodemailer'),
    // For testing
    stubTransport = require('nodemailer-stub-transport'),
    q = require('q');

var serverCtrlHelpers = require('../../../../system/server/controllers/helpers');

//exports.create = function(req, res) {
//
//    //User.where({teams: '547553c75de542cb3a5252ce'}).count(function (err, count) {
//    //    res.send(count + '');
//    //});
//    //
//    //return;
//    Team.remove({}, function (err) {
//        if (err) {
//            return res.send(err);
//        }
//    });
//    User.remove({}, function (err) {
//        if (err) {
//            return res.send(err);
//        }
//    });
//    req.body = {
//        team: {
//            name: 'A good team'
//        },
//        user: {
//            name: 'Some guy',
//            email: 'fuck@fuck.com'
//        }
//    };
//    var team = new Team(req.body.team);
//    var team2 = new Team(req.body.team);
//    //team.user = req.user;
//
//    team.validate(function (error) {
//        if (error) {
//            return res.send(team);
//        }
//    });
//
//    team.save(function(err) {
//        if (err) {
//            console.log('could not save team to database: ' + err);
//            return res.json(500, {
//                error: 'Cannot save the team'
//            });
//        }
//
//        team2.save(function (err) {
//            if (err) {
//                return res.json(err);
//            }
//            var user = new User(req.body.user);
//            user.teams = [team, team2];
//            user.save(function (err) {
//                if (err) {
//                    return res.send(err);
//                }
//                // Increment the userCount on the team document
//                // If this is a new record, increment the userCount for the team
//                var teams = user.teams;
//                _.each(teams, function (teamId) {
//                    Team.findOne({_id: teamId}, function (err, team) {
//                        if (!err) {
//                            console.error(team);
//                            team.userCount = team.userCount + 1;
//                            team.save(function (err) {
//                                if (err) {
//                                    return next(new Error('Could not update team user count'));
//                                }
//                            });
//                        }
//                    });
//                });
//                User
//                .findOne({})
//                .populate('Team')
//                .exec(function (err, user) {
//                    if (err) return res.json(err);
//
//                    res.json(user);
//                });
//            });
//        });
//        //res.json(team);
//    });
//};

/**
 * Ensure that the user making the request is on the team that they're requesting
 * @param userTeams
 * @param teamId
 * @returns {boolean}
 */
var checkUserOnThisTeam = function (userTeams, teamId) {
    return userTeams.indexOf(teamId) !== -1;
};

/**
 * Get tasks for the current requested user
 */
exports.getTeamById = function(req, res, next) {
    // Make sure a valid object ID was passed in
    if (!serverCtrlHelpers.checkValidObjectId(req.params.teamId)) {
        return res.status(400).send('Invalid object ID');
    }
    // Make sure the user is on the team that is being requested
    if (!checkUserOnThisTeam(req.user.teams, req.params.teamId)) {
        return res.status(401).send('Users can only request information on teams to which they belong');
    }
    // If all is good, return info on the team
    Team.getById(req.params.teamId, function (err, team) {
        if (err) {
            return next(err);
        }
        return res.json(team);
    });
};

/**
 * Invite a user to join your team like you're some kind of superhero crime fighter or something
 * @param email
 * @param team
 * @param newUser
 * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|qFactory.Deferred.promise|*}
 */
var inviteUserToTeam = function (email, team, newUser) {
    var deferred = q.defer(),
        transport, transporter, mailOptions, body;
    // newUser default false
    newUser = newUser || false;
    // Don't send emails for testing
    if (process.env.NODE_ENV === 'test') {
        transport = stubTransport();
    } else {
        // Send emails for real
        transport = {
            service: 'Gmail',
            auth: {
                user: 'logan@loganswalk.com',
                pass: 'xxxxxx'
            }
        };
    }
    // Find team for which this invitation pertains
    Team.getById(team, function (err, team) {
        // Create body
        body = '<p>You\'ve been invited to join ' + team.name + '</p>';
        if (newUser) {
            body = body + '\r\n<p>But first you have to sign up!</p>';
        }
        // Create transporter
        transporter = nodeMailer.createTransport(transport);
        // Set mail options
        mailOptions = {
            from: 'Logan Etherton <logan@loganswalk.com>',
            to: email,
            subject: 'Hello',
            html: body
        };
        // send mail with defined transport object
        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                deferred.reject('Could not send email');
            }
            deferred.resolve('Message sent: ' + info.response);
        });
    });
    return deferred.promise;
};

/**
 * If all error checking has passed, send the actual invitation
 * @param email
 * @param teamId
 * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|qFactory.Deferred.promise|*}
 */
var handleInvite = function (email, teamId) {
    var deferred = q.defer();
    // See if the requested user already has an account
    User.findByEmail(email, function (err, user) {
        if (err) {
            return next(new Error('Could not query user by email'));
        }
        // If the requested user exists in DB, send message about invite to this team
        if (user) {
            // Make sure the user being invited isn't already on the team that's inviting them
            if (checkUserOnThisTeam(user.teams, teamId)) {
                return res.status(200).send('This user is already on this team');
            }
            // Invite existing user
            return inviteUserToTeam(user.email, teamId).then(function (response) {
                // Email send
                deferred.resolve(response);
            }, function (error) {
                // Error
                deferred.reject('Unable to send invite: ' + error);
            });
        } else {
            // Send email to new user
            // Invite existing user
            return inviteUserToTeam(email, teamId, true).then(function (response) {
                // Email send
                deferred.resolve(response);
            }, function (error) {
                // Error
                deferred.reject('Unable to send invite: ' + error);
            });
        }
    });
    return deferred.promise;
};

/**
 * Invite a new user to a team
 * @param req
 * @param res
 * @param next
 */
exports.inviteToTeam = function (req, res) {
    // Ensure a valid team
    if (!req.body.hasOwnProperty('teamId') || !serverCtrlHelpers.checkValidObjectId(req.body.teamId)) {
        return res.status(400).send('A valid team ID must be passed in to this query');
    }
    // Ensure something is entered for email
    if (!req.body.hasOwnProperty('email')) {
        return res.status(400).send('An email address must be supplied');
    }
    // Ensure something valid is entered for email
    req.assert('email', 'You must enter a valid email address').isEmail();
    // Return an email on invalid email
    var errors = req.validationErrors();
    if (errors) {
        return res.status(400).send(errors);
    }
    // Make sure the user is on the team that is being requested
    if (!checkUserOnThisTeam(req.user.teams, req.body.teamId)) {
        return res.status(401).send('Users can only invite to teams to which they belong');
    }
    // Make sure the user isn't inviting themself
    if (req.body.email.toLowerCase() === req.user.email.toLowerCase()) {
        return res.status(400).send('You can\'t invite yourself, silly');
    }
    // Invite
    return handleInvite(req.body.email, req.body.teamId).then(function (response) {
        return res.status(200).send(response);
    }, function (error) {
        return res.status(400).send(error);
    });
};