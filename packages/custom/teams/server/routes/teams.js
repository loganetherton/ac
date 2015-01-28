'use strict';

var teams = require('../controllers/teams');

// The Package is past automatically as first parameter
module.exports = function (Teams, app, auth, database) {

    // Retrieve tasks for the current user
    app.route('/team/:teamId').
    all(auth.requiresLogin).
    get(teams.getTeamById);

    // Invite an email address to a team
    app.route('/inviteToTeam').
    all(auth.requiresLogin).
    post(teams.inviteToTeam);

    // Show outstanding invitations
};
