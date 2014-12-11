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

    //system.aggregateAsset('css', 'common.css');

    //system.aggregateAsset('css', 'demo.min.css');
    //system.aggregateAsset('css', 'font-awesome.min.css');
    //system.aggregateAsset('css', 'invoice.css');
    //system.aggregateAsset('css', 'lockscreen.min.css');
    //system.aggregateAsset('css', 'smartadmin-production-plugins.min.css');
    //system.aggregateAsset('css', 'smartadmin-production.min.css');
    //system.aggregateAsset('css', 'smartadmin-skins.min.css');
    //system.aggregateAsset('css', 'fixes.css');
    //system.aggregateAsset('css', 'your_style.css');

    system.aggregateAsset('css', 'flat.css');

    // The middleware in config/express will run before this code

    // Set views path, template engine and default layout
    app.set('views', __dirname + '/server/views');

    // Setting the favicon and static folder
    app.use(favicon(__dirname + '/public/assets/img/favicon.ico'));

    // Adding robots and humans txt
    app.use(express.static(__dirname + '/public/assets/static'));

    // Static image assets
    app.use('/img', express.static(__dirname + '/public/assets/img'));
    // Static fonts
    app.use('/fonts', express.static(__dirname + '/public/assets/fonts'));

    return system;
});
