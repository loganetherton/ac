'use strict';

// User routes use users controller
var users = require('../controllers/users'),
    config = require('meanio').loadConfig();

module.exports = function (MeanUser, app, auth, database, passport) {
    // Logout
    app.route('/logout').get(users.signout);

    // Get user info
    app.route('/users/me').get(users.me);

    // Search existing users for adding to teams
    app.route('/users/search/:searchTerm')
    .all(auth.requiresLogin)
    .get(users.userSearch);

    // Get all messages for the current user
    app.route('/user/getMessages')
    .all(auth.requiresLogin)
    .get(users.getMessages);

    // Send a message to a user
    app.route('/sendMessage')
    .all(auth.requiresLogin)
    .post(users.sendMessage);

    // Register an account
    app.route('/register').post(users.createAsync);

    // Email the user a password reset request
    app.route('/forgot-password').post(users.forgotpassword);

    // Allow the user to reset their password
    app.route('/reset/:token').post(users.resetpassword);

    // AngularJS route to check for authentication
    app.route('/loggedin').get(function (req, res) {
        res.send(req.isAuthenticated() ? req.user : '0');
    });

    // Write the inviting team to session if this user is responding to an invite
    app.route('/writeInviteToSession').post(users.writeInviteToSession);
    // Add an existing user to a team
    app.route('/checkInvitesOnSession').get(users.checkInvitesOnSession);

    // Login via normal password route
    app.route('/login').post(passport.authenticate('local', {
        failureFlash: true
    }), function (req, res) {
        res.send({
            user: req.user,
            redirect: 'site.tasklist'
        });
    });

    // AngularJS route to get config of social buttons
    app.route('/get-config').get(function (req, res) {
        res.send(config);
    });

    // Setting the facebook oauth routes
    app.route('/auth/facebook').get(passport.authenticate('facebook', {
        scope: ['email', 'public_profile'], failureRedirect: '#!/login'
    }), users.signin);

    app.route('/auth/facebook/callback').get(passport.authenticate('facebook', {
        failureRedirect: '/',
        successRedirect: '/'
    }), users.authCallback);

    // Setting the github oauth routes
    app.route('/auth/github').get(passport.authenticate('github', {
        failureRedirect: '#!/login'
    }), users.signin);

    app.route('/auth/github/callback').get(passport.authenticate('github', {
        failureRedirect: '#!/login'
    }), users.authCallback);

    // Setting the twitter oauth routes
    app.route('/auth/twitter').get(passport.authenticate('twitter', {
        failureRedirect: '#!/login'
    }), users.signin);

    app.route('/auth/twitter/callback').get(passport.authenticate('twitter', {
        failureRedirect: '#!/login'
    }), users.authCallback);

    // Setting the google oauth routes
    app.route('/auth/google').get(passport.authenticate('google', {
        failureRedirect: '#!/login',
        scope: ['https://www.googleapis.com/auth/userinfo.profile', 'https://www.googleapis.com/auth/userinfo.email']
    }), users.signin);

    app.route('/auth/google/callback').get(passport.authenticate('google', {
        failureRedirect: '#!/login'
    }), users.authCallback);

    // Setting the linkedin oauth routes
    app.route('/auth/linkedin').get(passport.authenticate('linkedin', {
        failureRedirect: '#!/login', scope: ['r_emailaddress']
    }), users.signin);

    app.route('/auth/linkedin/callback').get(passport.authenticate('linkedin', {
        failureRedirect: '#!/login'
    }), users.authCallback);

};
