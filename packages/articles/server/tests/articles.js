'use strict';
// Trying out emit when server starts
var mean = require('meanio');

describe('server setup', function () {
    var serverUp = false;
    before(function (done) {
        mean.events.on('serverStarted', function () {
            serverUp = true;
            done();
        });
    });

    it('should run the tests only after the server has been started', function () {
        console.log('server started');
        serverUp.should.be.ok;
    });
});
