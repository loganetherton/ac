'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Activities = new Module('activities');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Activities.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Activities.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Activities.menus.add({
    title: 'activities example page',
    link: 'activities example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Activities.aggregateAsset('css', 'activities.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Activities.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Activities.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Activities.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Activities;
});
