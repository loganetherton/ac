'use strict';

var taskList = require('../controllers/tasklist');

// Article authorization helpers
//var hasAuthorization = function (req, res, next) {
//    if (!req.user.isAdmin && req.article.user.id !== req.user.id) {
//        return res.send(401, 'User is not authorized');
//    }
//    next();
//};

// The Package is passed automatically as first parameter
module.exports = function (Tasklist, app, auth, database) {

    //app.get('/tasklist/example/anyone', function (req, res, next) {
    //    res.send('Anyone can access this');
    //});
    //
    //app.get('/tasklist/example/auth',
    //    auth.requiresLogin,
    //    function (req, res, next) {
    //        res.send('Only authenticated users can access this');
    //    }
    //);

    app.route('/tasklist').
    get(auth.requiresLogin, taskList.all);

    // Create a new task
    app.route('/newTask').
    post(auth.requiresLogin, taskList.create);

    // Retrieve a single task by ID
    app.route('/task/:taskId').
    get(auth.requiresLogin, taskList.singleTaskAsJson);

    // Retrieve tasks for the current user
    app.route('/tasks/user/:userId').
    get(auth.requiresLogin, taskList.getTasksByUserId);

    //app.get('/tasklist/example/admin',
    //    auth.requiresAdmin,
    //    function (req, res, next) {
    //        res.send('Only users with Admin role can access this');
    //});

    //app.get('/tasklist/example/render', function (req, res, next) {
    //    Tasklist.render('index', {
    //        package: 'tasklist'
    //    }, function (err, html) {
    //        //Rendering a view from the Package server/views
    //        res.send(html);
    //    });
    //});

    // Connection to socket
    Tasklist.io.on('connection', function (socket) {
        console.log('Connection from tasklist proof of concept');
    });
};
