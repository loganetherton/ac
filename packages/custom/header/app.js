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
  // Add in the css
  Header.aggregateAsset('css', 'header.css');

  return Header;
});
