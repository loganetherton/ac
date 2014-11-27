'use strict';

// The Package is past automatically as first parameter
module.exports = function(Acsocket, app, auth, database) {

  app.get('/acsocket/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/acsocket/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/acsocket/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/acsocket/example/render', function(req, res, next) {
    Acsocket.render('index', {
      package: 'acsocket'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
