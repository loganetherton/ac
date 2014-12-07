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
Taskdetails.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Taskdetails.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Taskdetails.menus.add({
    title: 'taskdetails example page',
    link: 'taskdetails example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Taskdetails.aggregateAsset('css', 'taskdetails.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Taskdetails.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Taskdetails.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Taskdetails.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Taskdetails;
});
