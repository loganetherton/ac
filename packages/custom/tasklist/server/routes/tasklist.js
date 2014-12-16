'use strict';

var taskList = require('../controllers/tasklist'),
    _ = require('lodash');

// The Package is passed automatically as first parameter
module.exports = function (Tasklist, app, auth, database) {

    app.route('/tasklist').
    get(auth.requiresLogin, taskList.all);

    app.route('/queryTasklist/:query').
    get(auth.requiresLogin, taskList.queryList);

    // Create a new task
    app.route('/newTask').
    post(auth.requiresLogin, taskList.create);

    // Retrieve tasks for the current user
    app.route('/tasks/user/:userId').
    all(auth.requiresLogin).
    get(taskList.getTasksByUserId);

    // Retrieve tasks for the requested team
    app.route('/tasks/team/:teamId').
    get(auth.requiresLogin, taskList.getTasksByTeamId);

    // Retrieve tasks for this team's graph
    app.route('/tasks/team/graph/:teamId').
    get(auth.requiresLogin, taskList.getTeamTasksForGraph);

    // Connection to socket
    Tasklist.io.of('/task').on('connection', function (socket) {
        //console.log(socket);
        if (_.isUndefined(app.get('teams'))) {
            return;
        }
        console.log('joined in tasklist route');
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
