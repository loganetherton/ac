'use strict';

var fs = require('fs-extra'),
    path = require('path');

// The Package is past automatically as first parameter
module.exports = function (Recentprojects, app, auth, database) {

    app.route('/projects/projects.json').get(auth.requiresLogin, function (req, res, next) {
        var activityTestJson = path.resolve(__dirname, '../data/projects.json');
        // Make sure we're dealing with an actual file
        fs.ensureFile(activityTestJson, function (err) {
            if (err) {
                console.log(err);
                return res.send('Projects test JSON file does not exist');
            }
            // Read the JSON file and send results
            fs.readJsonFile(activityTestJson, function (err, data) {
                if (err) {
                    return res.send('Could not read projects JSON file');
                }
                return res.json(data);
            });
        });
    });

    app.get('/recentprojects/example/anyone', function (req, res, next) {
        res.send('Anyone can access this');
    });

    app.get('/recentprojects/example/auth', auth.requiresLogin, function (req, res, next) {
        res.send('Only authenticated users can access this');
    });

    app.get('/recentprojects/example/admin', auth.requiresAdmin, function (req, res, next) {
        res.send('Only users with Admin role can access this');
    });

    app.get('/recentprojects/example/render', function (req, res, next) {
        Recentprojects.render('index', {
            package: 'recentprojects'
        }, function (err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
};
