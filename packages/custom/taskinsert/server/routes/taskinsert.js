'use strict';

// The Package is past automatically as first parameter
module.exports = function(Taskinsert, app, auth, database) {

  app.get('/taskinsert/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/taskinsert/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/taskinsert/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/taskinsert/example/render', function(req, res, next) {
    Taskinsert.render('index', {
      package: 'taskinsert'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
