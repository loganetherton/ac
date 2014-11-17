'use strict';

// The Package is past automatically as first parameter
module.exports = function(Navigation, app, auth, database) {

  app.get('/navigation/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/navigation/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/navigation/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/navigation/example/render', function(req, res, next) {
    Navigation.render('index', {
      package: 'navigation'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
