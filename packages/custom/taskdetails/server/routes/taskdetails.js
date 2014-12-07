'use strict';

// The Package is past automatically as first parameter
module.exports = function(Taskdetails, app, auth, database) {

  app.get('/taskdetails/example/anyone', function(req, res, next) {
    res.send('Anyone can access this');
  });

  app.get('/taskdetails/example/auth', auth.requiresLogin, function(req, res, next) {
    res.send('Only authenticated users can access this');
  });

  app.get('/taskdetails/example/admin', auth.requiresAdmin, function(req, res, next) {
    res.send('Only users with Admin role can access this');
  });

  app.get('/taskdetails/example/render', function(req, res, next) {
    Taskdetails.render('index', {
      package: 'taskdetails'
    }, function(err, html) {
      //Rendering a view from the Package server/views
      res.send(html);
    });
  });
};
