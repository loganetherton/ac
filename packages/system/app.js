'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module,
    favicon = require('serve-favicon'),
    express = require('express'),
    system = new Module('system');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
system.register(function (app, auth, database) {

    //We enable routing. By default the Package Object is passed to the routes
    system.routes(app, auth, database);

    system.aggregateAsset('css', 'common.css');
    system.aggregateAsset('css', 'bootstrap.css');

    // The middleware in config/express will run before this code

    // Set views path, template engine and default layout
    app.set('views', __dirname + '/server/views');

    // Setting the favicon and static folder
    app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));

    // Adding robots and humans txt
    app.use(express.static(__dirname + '/public/assets/static'));

    return system;
});
