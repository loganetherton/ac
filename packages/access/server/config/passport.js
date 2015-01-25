'use strict';

var mongoose = require('mongoose'),
    LocalStrategy = require('passport-local').Strategy,
    TwitterStrategy = require('passport-twitter').Strategy,
    FacebookStrategy = require('passport-facebook').Strategy,
    GitHubStrategy = require('passport-github').Strategy,
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
    LinkedinStrategy = require('passport-linkedin').Strategy,
    User = mongoose.model('User'),
    config = require('meanio').loadConfig(),
    Team = mongoose.model('Team'),
    _ = require('lodash'),
    async = require('async');

module.exports = function (passport) {

    // Serialize the user id to push into the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });

    // Deserialize the user object based on a pre-serialized token
    // which is the user id
    passport.deserializeUser(function (id, done) {
        User.findOne({
            _id: id
        }, '-salt -hashed_password', function (err, user) {
            done(err, user);
        });
    });

    // Use local strategy
    passport.use(new LocalStrategy({
        usernameField: 'email', passwordField: 'password'
    }, function (email, password, done) {
        User.findOne({
            email: email
        }, function (err, user) {
            if (err) {
                return done(err);
            }
            if (!user) {
                return done(null, false, {
                    message: 'Unknown user'
                });
            }
            if (!user.authenticate(password)) {
                return done(null, false, {
                    message: 'Invalid password'
                });
            }
            return done(null, user);
        });
    }));

    // Use twitter strategy
    passport.use(new TwitterStrategy({
        consumerKey: config.twitter.clientID,
        consumerSecret: config.twitter.clientSecret,
        callbackURL: config.twitter.callbackURL
    }, function (token, tokenSecret, profile, done) {
        return ssoAuth(profile, 'twitter', done);
    }));

    var multipleStrategyUser = null,
        loginStrategy, profile, user;

    /**
     * If a user with this email has logged on before using another method, add this SSO id and log the user in
     * @param callback
     * @returns {*}
     */
    var checkMultipleSsoMethods = function (callback) {
        // If this strategy returns email, search by email. If not, such as Twitter, SORRY
        if (_.has(profile, 'emails')) {
            // Find the user based on the first email returned
            // @todo This is weak, need to check all emails
            User.findOne({
                email: profile.emails[0].value
            }, function (err, user) {
                // Return on error
                if (err) {
                    return callback('Error on finding user by email');
                }
                // If a user was found using a different login strategy
                if (user) {
                    // Add this login strategy to this user's account
                    user[loginStrategy] = profile;
                    user.save(function (err) {
                        if (err) {
                            return callback(new Error(err));
                        }
                        return callback(null, user);
                    });
                } else {
                    return callback();
                }
            });
        } else {
            return callback();
        }
    };

    /**
     * If a user was not found using the current SSO method or via email, then create a new user
     * @param callback
     * @returns {*}
     */
    var createNewUserSso = function (callback) {
        if (multipleStrategyUser) {
            return callback(null, multipleStrategyUser);
        }
        // If we've made it this far, go ahead and create the user
        var userObj = {
            name: profile.displayName,
            provider: loginStrategy,
            roles: ['authenticated']
        };
        // Add the details from the login strategy return
        userObj[loginStrategy] = profile._json;
        // Add email if this login strategy has it
        if (_.has(profile, 'emails')) {
            userObj.email = profile.emails[0].value;
        } else {
            // Handling twitter's dumb ass
            userObj.email = profile.id + '@twitter.com';
        }
        user = new User(userObj);
        // Create a team for this user
        var team = new Team({
            name: user.name + '\'s Team'
        });
        // Save the team
        team.save(function (err) {
            if (err) {
                return callback(new Error(err));
            }
            // Add user to team
            user.teams.push(team._id);
            // Save the user
            user.save(function (err) {
                if (err) {
                    // Done from passport takes three parameters: error, false for failure, something truthy for
                    // success, and finally, object with info
                    return callback(new Error(err));
                } else {
                    return callback(null, user);
                }
            });
        });
    };

    /**
     * Generalize SSO authorization function
     *
     * @todo REFACTOR ME
     *
     * @param profile
     * @param loginStrategy
     * @param done
     */
    var ssoAuth = function (thisProfile, loginStrategy, done) {
        var userSearch = {};
        loginStrategy = loginStrategy;
        profile = thisProfile;
        // Search by the login strategy id (some are strings, some are ints...)
        userSearch[loginStrategy + '.id'] = loginStrategy === 'twitter' ? parseInt(profile.id) : profile.id;
        return User.findOne(userSearch, function (err, user) {
            // Return on error
            if (err) {
                return done(err);
            }
            // If the user found, let's log that puppy in
            if (user) {
                return done(err, user);
            }
            // Check for users this email, different strategy. Then create or log the user in
            return async.series([checkMultipleSsoMethods, createNewUserSso],
            // Log the user in, if one was found
            function (err, user) {
                if (err) {
                    return done(null, false, {
                        message: loginStrategy + ' login failed, email already used by other login strategy'}
                    );
                }
                return done(err, user[1]);
            });
        });
    };

    // Use facebook strategy
    passport.use(new FacebookStrategy({
        clientID: config.facebook.clientID,
        clientSecret: config.facebook.clientSecret,
        callbackURL: config.facebook.callbackURL
    }, function (accessToken, refreshToken, profile, done) {
        ssoAuth(profile, 'facebook', done);
    }));

    // Use github strategy
    passport.use(new GitHubStrategy({
        clientID: config.github.clientID,
        clientSecret: config.github.clientSecret,
        callbackURL: config.github.callbackURL
    }, function (accessToken, refreshToken, profile, done) {
        User.findOne({
            'github.id': profile.id
        }, function (err, user) {
            if (user) {
                return done(err, user);
            }
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.username,
                provider: 'github',
                github: profile._json,
                roles: ['authenticated']
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return done(null, false,
                    {message: 'Github login failed, email already used by other login strategy'});
                } else {
                    return done(err, user);
                }
            });
        });
    }));

    // Use google strategy
    passport.use(new GoogleStrategy({
        clientID: config.google.clientID,
        clientSecret: config.google.clientSecret,
        callbackURL: config.google.callbackURL
    }, function (accessToken, refreshToken, profile, done) {
        return ssoAuth(profile, 'google', done);
    }));

    // use linkedin strategy
    passport.use(new LinkedinStrategy({
        consumerKey: config.linkedin.clientID,
        consumerSecret: config.linkedin.clientSecret,
        callbackURL: config.linkedin.callbackURL,
        profileFields: ['id', 'first-name', 'last-name', 'email-address']
    }, function (accessToken, refreshToken, profile, done) {
        User.findOne({
            'linkedin.id': profile.id
        }, function (err, user) {
            if (user) {
                return done(err, user);
            }
            user = new User({
                name: profile.displayName,
                email: profile.emails[0].value,
                username: profile.emails[0].value,
                provider: 'linkedin',
                roles: ['authenticated']
            });
            user.save(function (err) {
                if (err) {
                    console.log(err);
                    return done(null, false,
                    {message: 'LinkedIn login failed, email already used by other login strategy'});
                } else {
                    return done(err, user);
                }
            });
        });
    }));
};
