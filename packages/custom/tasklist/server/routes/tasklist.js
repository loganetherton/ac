'use strict';

var taskList = require('../controllers/tasklist');

// Article authorization helpers
//var hasAuthorization = function (req, res, next) {
//    if (!req.user.isAdmin && req.article.user.id !== req.user.id) {
//        return res.send(401, 'User is not authorized');
//    }
//    next();
//};

// The Package is passed automatically as first parameter
module.exports = function (Tasklist, app, auth, database, MeanSocket) {

    var bodyParser = require('body-parser');
    var server = require('http').createServer(app);
    var io = require('socket.io').listen(server);
    //var moment = require('moment');
    var PORT = 8282;

    Tasklist.io = io;
    Tasklist.port = PORT;

    //parse application/x-www-form-urlencoded
    app.use(bodyParser.urlencoded({ extended: true }));

    // parse application/json
    app.use(bodyParser.json());

    // parse application/vnd.api+json as json
    app.use(bodyParser.json({
        type: 'application/vnd.api+json'
    }));

    server.listen(PORT, function() {
        console.log('Chat now listening on port: ' + PORT + '\n');
    });

    var allowCrossDomain = function(req, res, next) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');

        // intercept OPTIONS method
        if ('OPTIONS' === req.method) {
            res.send(200);
        } else {
            next();
        }
    };
    app.use(allowCrossDomain);

    io.of('/task').on('connection', function(socket) {
        //console.log('Tasklist - user connected');

        socket.on('disconnect', function() {
            console.log('Tasklist - user disconnected');
        });
        socket.on('newTask', function(testData) {
            console.log(socket);
            //var message = user.name + ' joined the room';
            io.of('/task').emit('newTask', {
                data: testData.data
            }, console.log('after emit'));
        });
    });

    //app.get('/tasklist/example/anyone', function (req, res, next) {
    //    res.send('Anyone can access this');
    //});
    //
    //app.get('/tasklist/example/auth',
    //    auth.requiresLogin,
    //    function (req, res, next) {
    //        res.send('Only authenticated users can access this');
    //    }
    //);

    app.route('/tasklist').
        get(auth.requiresLogin, taskList.all).
        post(auth.requiresLogin, taskList.create);

    app.route('/task').
        get(auth.requiresLogin, taskList.findOne).
        post(auth.requiresLogin, taskList.create);

    app.get('/tasklist/example/admin',
        auth.requiresAdmin,
        function (req, res, next) {
            res.send('Only users with Admin role can access this');
    });

    app.get('/tasklist/example/render', function (req, res, next) {
        Tasklist.render('index', {
            package: 'tasklist'
        }, function (err, html) {
            //Rendering a view from the Package server/views
            res.send(html);
        });
    });
};
