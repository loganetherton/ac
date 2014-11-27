'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Socket = new Module('socket');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Socket.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Socket.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Socket.menus.add({
    title: 'socket example page',
    link: 'socket example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Socket.aggregateAsset('css', 'socket.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Socket.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Socket.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Socket.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Socket;
});
