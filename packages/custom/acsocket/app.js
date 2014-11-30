'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Acsocket = new Module('acsocket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Acsocket.register(function (app, auth, database, http) {

    //var io = require('./server/config/socketConfig')(http);
    var io = require('../../contrib/socket/server/config/socketio')(http);
    // Expose IO on the acsocket registration
    Acsocket.io = io;

    //We enable routing. By default the Package Object is passed to the routes
    // Ok, the items available in routing via DI are all defined here
    Acsocket.routes(io, app, auth, database);

    return Acsocket;
});