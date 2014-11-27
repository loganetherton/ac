'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MeanSocket = new Module('socket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
MeanSocket.register(function(app, auth, database, http) {

    var io = require('./server/config/socketio')(http);
    MeanSocket.io = io;

    //We enable routing. By default the Package Object is passed to the routes
    MeanSocket.routes(io);

    return MeanSocket;
});
