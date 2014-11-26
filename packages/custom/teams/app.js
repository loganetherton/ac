'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Teams = new Module('teams');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Teams.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Teams.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  Teams.menus.add({
    title: 'teams example page',
    link: 'teams example page',
    roles: ['authenticated'],
    menu: 'main'
  });
  
  Teams.aggregateAsset('css', 'teams.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Teams.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Teams.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Teams.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Teams;
});
