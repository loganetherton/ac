'use strict';

var mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User');

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
    return userTeams.indexOf(teamId) !== -1
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
 * Invite a new user to a team
 * @param req
 * @param res
 * @param next
 */
exports.inviteToTeam = function (req, res, next) {
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
    // See if the requested user already has an account
    User.findByEmail(req.body.email, function (err, user) {
        if (err) {
            return next(new Error('Could not query user by email'));
        }
        // If the requested user exists in DB, send message about invite to this team
        if (user) {
            // Send email to existing user
            return res.status(200).send('Existing user invited to team');
        }
        // Send email to new user
        return res.status(200).send('New user invited to team');
    });
};