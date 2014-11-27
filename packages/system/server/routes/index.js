'use strict';

module.exports = function(System, app, auth, database) {

    // Home route
    var index = require('../controllers/index');
    //app.route('/').get(auth.requiresLogin, index.render);
    app.route('/').get(index.render);

    app.route('/logger').post(index.log);

    /**
     * Create websocket
     */
    //var bodyParser = require('body-parser');
    //var server = require('http').createServer(app);
    //var io = require('socket.io').listen(server);
    ////var moment = require('moment');
    //var PORT = 8282;
    //
    ////System.io = io;
    ////System.port = PORT;
    //
    ////parse application/x-www-form-urlencoded
    //app.use(bodyParser.urlencoded({ extended: true }));
    //
    //// parse application/json
    //app.use(bodyParser.json());
    //
    //// parse application/vnd.api+json as json
    //app.use(bodyParser.json({
    //    type: 'application/vnd.api+json'
    //}));
    //
    //server.listen(PORT, function() {
    //    console.log('Socket now listening on port: ' + PORT + '\n');
    //});
    //
    //var allowCrossDomain = function(req, res, next) {
    //    res.header('Access-Control-Allow-Origin', '*');
    //    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    //    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    //
    //    // intercept OPTIONS method
    //    if ('OPTIONS' === req.method) {
    //        res.send(200);
    //    } else {
    //        next();
    //    }
    //};
    //app.use(allowCrossDomain);
    //
    //io.of('/task').on('connection', function(socket) {
    //    //console.log('Tasklist - user connected');
    //
    //    socket.on('disconnect', function() {
    //        console.log('Tasklist - user disconnected');
    //    });
    //    socket.on('newTask', function(testData) {
    //        //var message = user.name + ' joined the room';
    //        io.of('/task').emit('newTask', {
    //            data: testData.data
    //        }, console.log('after emit'));
    //    });
    //});
};
