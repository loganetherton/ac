'use strict';

// The Package is past automatically as first parameter
module.exports = function(Dashboard, app, auth, database) {

  app.get('/dashboard/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/dashboard/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/dashboard/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/dashboard/example/render', function(req, res, next) {
    Dashboard.render('index', {
      package: 'dashboard'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
