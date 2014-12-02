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

    app.route('/tasklist').
    get(auth.requiresLogin, taskList.all);

    // Create a new task
    app.route('/newTask').
    post(auth.requiresLogin, taskList.create);

    // Retrieve a single task by ID
    app.route('/task/:taskId').
    get(auth.requiresLogin, taskList.singleTaskAsJson);
    app.param('taskId', taskList.queryTaskById);

    // Retrieve tasks for the current user
    app.route('/tasks/user/:userId').
    get(auth.requiresLogin, taskList.getTasksByUserId);

    // Set teams for access in socket
    app.use(function (req, res, next) {
        var currentTeam = app.get('teams');
        if (typeof currentTeam === 'undefined' || !currentTeam || !currentTeam.length) {
            app.set('teams', req.session.teams || null);
        }
        next();
    });

    // Connection to socket
    Tasklist.io.of('/task').on('connection', function (socket) {
        var teamRoom = 'team:' + app.get('teams');
        // Join the socket for this team
        socket.join(teamRoom);

        // Emit the new task to all team members
        socket.on('newTask', function(taskData) {
            Tasklist.io.of('/task').in(teamRoom).emit('newTask', {
                data: taskData.data
            }, console.log('after emit'));
        });
    });
};
