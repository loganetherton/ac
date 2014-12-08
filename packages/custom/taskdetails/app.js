'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Taskdetails = new Module('taskdetails');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Taskdetails.register(function (app, auth, database, io) {

    Taskdetails.io = io;

    //We enable routing. By default the Package Object is passed to the routes
    Taskdetails.routes(app, auth, database);

    Taskdetails.aggregateAsset('css', 'taskdetails.css');

    return Taskdetails;
});
