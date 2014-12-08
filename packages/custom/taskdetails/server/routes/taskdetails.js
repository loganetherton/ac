'use strict';

var taskDetails = require('../controllers/taskDetailsCtrl');

// The Package is past automatically as first parameter
module.exports = function(Taskdetails, app, auth, database) {
    // Retrieve a single task by ID
    app.route('/task/:taskId').
    all(auth.requiresLogin).
    get(taskDetails.singleTaskAsJson);

    // Connection to socket
    Taskdetails.io.of('/task').on('connection', function (socket) {
        //console.log('teams in taskdetails');
        //console.log(app.get('teams'));
        //var teamRoom = 'team:' + app.get('teams');
        //// Join the socket for this team
        //socket.join(teamRoom);
        //
        //// Emit the new task to all team members
        //socket.on('newTask', function(taskData) {
        //    Tasklist.io.of('/task').in(teamRoom).emit('newTask', {
        //        data: taskData.data
        //    }, console.log('after emit'));
        //});
    });
};
