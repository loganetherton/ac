'use strict';

/*
 * Defining the Package
 */
var Module = require('meanio').Module;

var Header = new Module('header');

/*
 * All MEAN packages require registration
 * Dependency injection is used to define required modules
 */
Header.register(function(app, auth, database) {

  //We enable routing. By default the Package Object is passed to the routes
  Header.routes(app, auth, database);

  //We are adding a link to the main menu for all authenticated users
  //Header.menus.add({
  //  title: 'header example page',
  //  link: 'header example page',
  //  roles: ['authenticated'],
  //  menu: 'main'
  //});
  //
  //Header.aggregateAsset('css', 'header.css');

  /**
    //Uncomment to use. Requires meanio@0.3.7 or above
    // Save settings with callback
    // Use this for saving data from administration pages
    Header.settings({
        'someSetting': 'some value'
    }, function(err, settings) {
        //you now have the settings object
    });

    // Another save settings example this time with no callback
    // This writes over the last settings.
    Header.settings({
        'anotherSettings': 'some value'
    });

    // Get settings. Retrieves latest saved settigns
    Header.settings(function(err, settings) {
        //you now have the settings object
    });
    */

  return Header;
});
