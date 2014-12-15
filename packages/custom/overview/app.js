'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Overview = new Module('overview');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Overview.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Overview.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Overview.menus.add({
    title: 'overview example page',
    link: 'overview example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Overview.aggregateAsset('css', 'overview.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Overview.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Overview.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Overview.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Overview;
});
