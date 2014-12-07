'use strict';

var taskDetails = require('../controllers/taskDetailsCtrl');

// The Package is past automatically as first parameter
module.exports = function(Taskdetails, app, auth, database) {
    // Retrieve a single task by ID
    app.route('/task/:taskId').
    all(auth.requiresLogin).
    get(taskDetails.singleTaskAsJson);
};
