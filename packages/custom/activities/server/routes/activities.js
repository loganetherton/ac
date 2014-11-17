'use strict';

var activities = require('../controllers/activities');

// The Package is past automatically as first parameter
module.exports = function (Activities, app, auth, database) {

    // Get initial activities json to populate the activities window
    app.route('/activities/activity.json')
        .get(auth.requiresLogin, activities.getActivitiesTestJson);

    app.get('/activities/example/anyone', function (req, res, next) {
        res.send('Anyone can access this');
    });

    app.get('/activities/example/auth', auth.requiresLogin, function (req, res, next) {
        res.send('Only authenticated users can access this');
    });

    app.get('/activities/example/admin', auth.requiresAdmin, function (req, res, next) {
        res.send('Only users with Admin role can access this');
    });

    app.get('/activities/example/render', function (req, res, next) {
        Activities.render('index', {
            package: 'activities'
        }, function (err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
};
