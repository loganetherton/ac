'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var MeanUser = new Module('users');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 *
 * Holy shit, the order doesn't matter. These are dependencies! app, auth, passport, etc
 *
 * These dependencies are registered throughout using mean.register calls. For example, passport is registered
 * in access/app.js
 */
MeanUser.register(function(app, auth, passport, database) {

  //We enable routing. By default the Package Object is passed to the routes
  MeanUser.routes(app, auth, database, passport);

  //We are adding a link to the main menu for all authenticated users
  // MeanUser.menus.add({
  //     title: 'meanUser example page',
  //     link: 'meanUser example page',
  //     roles: ['authenticated'],
  //     menu: 'main'
  // });

  MeanUser.aggregateAsset('js', 'meanUser.js');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    MeanUser.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    MeanUser.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    MeanUser.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return MeanUser;
});
