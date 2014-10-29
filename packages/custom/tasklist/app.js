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
Tasklist.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Tasklist.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Tasklist.menus.add({
    title: 'Tasklist',
    link: 'tasklist',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Tasklist.aggregateAsset('css', 'tasklist.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Tasklist.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Tasklist.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Tasklist.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Tasklist;
});
