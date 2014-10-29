'use strict';

// The Package is past automatically as first parameter
module.exports = function(Tasklist, app, auth, database) {

  app.get('/tasklist/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/tasklist/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/tasklist/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/tasklist/example/render', function(req, res, next) {
    Tasklist.render('index', {
      package: 'tasklist'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
