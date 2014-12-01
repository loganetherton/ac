'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Tasklist = new Module('tasklist');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Tasklist.register(function (app, auth, database, io) {
    // Attach the socket to Tasklist
    Tasklist.io = io;

    //We enable routing. By default the Package Object is passed to the routes
    Tasklist.routes(app, auth, database);

    Tasklist.aggregateAsset('css', 'tasklist.css');

    return Tasklist;
});
