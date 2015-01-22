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
    Team = mongoose.model('Team');

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
exports.create = function (req, res, next) {
    var user = new User(req.body);
    var team = new Team({
        name: user.name + '\'s Team'
    });

    user.provider = 'local';

    // Because we set our user.provider to local our models/user.js validation will always be true
    req.assert('name', 'You must enter a name').notEmpty();
    req.assert('email', 'You must enter a valid email address').isEmail();
    req.assert('password', 'You must enter a password').notEmpty();
    req.assert('password', 'Password must be between 8-100 characters long').len(8, 100);
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
        user.roles = ['authenticated'];
        user.teams.push(team._id);
        // Save the user
        user.save(function (err) {
            if (err) {
                switch (err.code) {
                /**
                 * Todo Handle specific index breaking errors
                 */
                    default:
                        var modelErrors = [];

                        if (err.errors) {

                            for (var x in err.errors) {
                                if (!err.errors.hasOwnProperty(x)) {
                                    continue;
                                }
                                modelErrors.push({
                                    param: x, msg: err.errors[x].message, value: err.errors[x].value
                                });
                            }
                            res.status(400).send(modelErrors);
                        }
                }
                return res.status(400);
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