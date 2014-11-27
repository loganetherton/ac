'use strict';

// The Package is past automatically as first parameter
module.exports = function(Socket, app, auth, database) {

  app.get('/socket/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/socket/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/socket/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/socket/example/render', function(req, res, next) {
    Socket.render('index', {
      package: 'socket'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
