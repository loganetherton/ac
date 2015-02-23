'use strict';

var mongoose = require('mongoose'),
    request = require('supertest'),
    server = request.agent('http://localhost:3000'),
    should = require('should'),
    Message = mongoose.model('Message'),
    Promise = require('bluebird');

// Helpers
var userTaskHelper = require('../../../../test/mochaHelpers/userTaskHelpers'),
    loginUser = require('../../../../test/mochaHelpers/loginUser');

var user;

describe('GET /user/getMessages', function () {
    // Clear users and teams
    before(function (done) {
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers(),
                     userTaskHelper.clearMessages()]).then(function () {
            done();
        });
    });

    // Create a user for testing
    before(function (done) {
        userTaskHelper.createUserAndTeam().then(function (userTeam) {
            user = userTeam['user'];
            done();
        });
    });

    // Clear users and teams
    after(function (done) {
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers(),
                     userTaskHelper.clearMessages()]).then(function () {
            done();
        });
    });

    describe('unauthenticated', function () {
        it('should not allow unauthenticated requests', function (done) {
            server
            .get('/user/getMessages')
            .expect(401)
            .end(function (err, res) {
                should.not.exist(err);
                done();
            });
        });
    });

    describe('authenticated', function () {
        before(function (done) {
            loginUser(server, user.email, user.password).then(function () {
                done();
            });
        });

        it('should return an empty string if the user has no messages', function (done) {
            server
            .get('/user/getMessages')
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                res.text.should.be.equal('No messages');
                done();
            });
        });

        it('should return all messages the user has', function (done) {
            // First message
            var messageRaw = {
                user: user._id,
                content: 'First message'
            };
            var message = new Message(messageRaw);
            // Second message
            messageRaw.content = 'Second message';
            var message2 = new Message(messageRaw);
            // Save message 1
            message.save(function (err) {
                should.not.exist(err);
                // Save message 2
                message2.save(function (err) {
                    should.not.exist(err);
                    // Get messages from API
                    server
                    .get('/user/getMessages')
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        // Both messages should be returned
                        res.body.should.have.length(2);
                        res.body[0].content.should.be.equal('First message');
                        res.body[1].content.should.be.equal('Second message');
                        done();
                    });
                });
            });
        });
    });
});