'use strict';

// Karma configuration
module.exports = function(config) {
  var _ = require('lodash'),
    basePath = '.',
    assets = require(basePath + '/config/assets.json');

  config.set({

    // base path, that will be used to resolve files and exclude
    basePath: basePath,

    // frameworks to use
    frameworks: ['jasmine'],

    // list of files / patterns to load in the browser
    files: _.flatten(_.values(assets.core.js)).concat([
      'packages/*/public/*.js',
      'packages/*/public/*/*.js',
      'packages/custom/*/public/*.js',
      'packages/custom/*/public/*/*.js',


      'bower_components/angular/angular.js',
      'bower_components/angular-bootstrap/ui-bootstrap.js',
      'bower_components/angular-cookies/angular-cookies.js',
      'bower_components/angular-mocks/angular-mocks.js',
      'bower_components/angular-resource/angular-resource.js',
      'bower_components/angular-route/angular-route.js',
      'bower_components/angular-ui-router/release/angular-ui-router.js',

      'browserTrigger.js',

      'packages/**/*.html'

      //'node_modules/karma-ng-html2js-preprocessor/lib/index.js'
    ]),

      // list of files to exclude
      exclude: [],

      // test results reporter to use
      // possible values: 'dots', 'progress', 'junit', 'growl', 'coverage'
      reporters: ['progress', 'coverage'],

      // coverage
      preprocessors: {
          // source files that you want to generate coverage for
          // do not include tests or libraries
          // (these files will be instrumented by Istanbul)
          'packages/**/public/controllers/*.js': ['coverage'],
          'packages/**/public/services/*.js': ['coverage'],


          // This is a direct call, only for debugging
          'packages/custom/**/public/views/**/*.html': ['ng-html2js']
          //'packages/custom/recentprojects/public/views/directiveTemplates/recent-projects.html': ['ng-html2js']
          //'packages/**/public/views/directiveTemplates/*.js': ['ng-html2js']
          //'packages/**/*.html': ['ng-html2js']
      },

      /**********************************************************
       * Until the pull request is accepted, this will only with with my repo version of karma-ng-html2js
       * https://github.com/loganetherton/karma-ng-html2js-preprocessor-1
       **********************************************************/
      ngHtml2JsPreprocessor: {
          // If your build process changes the path to your templates,
          // use stripPrefix and prependPrefix to adjust it.
          // Actual: packages/custom/tasklist/public/views/...
          // Served: /tasklist/views/directiveTemplates/tasklist-directive.html
          stripPrefix: '.*/(.*)/public/views/directiveTemplates/',
          prependPrefix: '{$1}/views/directiveTemplates/',

          // the name of the Angular module to create
          moduleName: 'mean.templates'
      },

      coverageReporter: {
          type: 'html',
          dir: 'test/coverage/'
      },

    // web server port
    port: 9876,

    // enable / disable colors in the output (reporters and logs)
    colors: true,

    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,

    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,

    // Start these browsers, currently available:
    // - Chrome
    // - ChromeCanary
    // - Firefox
    // - Opera
    // - Safari (only Mac)
    // - PhantomJS
    // - IE (only Windows)
    browsers: ['PhantomJS'],
      //browsers: ['Chrome'],

    // If browser does not capture in given timeout [ms], kill it
    captureTimeout: 60000,

    // Continuous Integration mode
    // if true, it capture browsers, run tests and exit
    singleRun: true
  });
};
