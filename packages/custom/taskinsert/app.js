'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Taskinsert = new Module('taskinsert');

Taskinsert.register(function(app, auth, database) {
    // Set routing dependencies
    Taskinsert.routes(app, auth, database);
    return Taskinsert;
});
