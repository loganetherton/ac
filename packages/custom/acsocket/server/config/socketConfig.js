'use strict';

var config = require('meanio').loadConfig(),
    cookie = require('cookie'),
    cookieParser = require('cookie-parser'),
    socketio = require('socket.io');

module.exports = function (http) {
    var io = socketio.listen(http);

    // See http://stackoverflow.com/questions/19106861/socket-io-authorization-nodejs
    io.use(function (socket, next) {
        var data = socket.request;

        if (!data.headers.cookie) {
            return next(new Error('No cookie transmitted for socket'));
        }

        var parsedCookie = cookie.parse(data.headers.cookie);
        var sessionId = parsedCookie[config.sessionName];
        var parsedSessionId = cookieParser.signedCookie(parsedCookie[config.sessionName], config.sessionSecret);

        if (sessionId === parsedSessionId) {
            return next(new Error('Invalid cookie'));
        }

        next();
    });

    return io;
};