'use strict';

// The Package is past automatically as first parameter
module.exports = function(Overview, app, auth, database) {

  app.get('/overview/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/overview/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/overview/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/overview/example/render', function(req, res, next) {
    Overview.render('index', {
      package: 'overview'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
