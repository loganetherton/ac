'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Recentprojects = new Module('recentprojects');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Recentprojects.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Recentprojects.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Recentprojects.menus.add({
    title: 'recentprojects example page',
    link: 'recentprojects example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Recentprojects.aggregateAsset('css', 'recentprojects.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Recentprojects.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Recentprojects.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Recentprojects.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Recentprojects;
});
