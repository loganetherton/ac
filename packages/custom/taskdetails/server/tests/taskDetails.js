'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    q = require('q');

// Superagent
var request = require('supertest'),
    server = request.agent('http://localhost:3000');

// Helpers
var userTaskHelper = require('../../../../../test/mochaHelpers/initUserAndTasks'),
    loginUser = require('../../../../../test/mochaHelpers/loginUser');

/**
 * Global user and task model
 */
var user;
var task;

describe('GET /task/:taskId API', function () {
    // Find a single task
    var findTask = function () {
        var defer = q.defer();
        Task.find({}, function (err, data) {
            if (err) {
                should.not.exist(err);
                defer.reject('Could not find task ID');
            }
            defer.resolve(data[0]._id);
        });
        return defer.promise;
    };

    // Create user and task only once
    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });
    // Remove user and task at the end
    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
    });

    describe('retrieve a single a task (unauthenticated)', function () {
        it('should deny an unauthenticated user to retrieve a task', function (done) {
            findTask().then(function (taskId) {
                server
                .get('/task/' + taskId)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(401);
                    res.text.should.be.equal('User is not authorized');
                    done();
                });
            });
        });
    });

    describe('retrieve a single a task (authenticated)', function () {
        describe('on team that created task', function () {
            before(function (done) {
                loginUser(server, 'test@test.com', 'password', done);
            });
            it('should prevent invalid object IDs from being passed in', function (done) {
                server
                .get('/task/badID')
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.text.should.be.equal('Invalid object ID');
                    done();
                });
            });
            it('should allow an authenticated user to retrieve a task', function (done) {
                // Get the single task ID in the database
                findTask().then(function (taskId) {
                    server
                    .get('/task/' + taskId)
                    .expect(200)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        res.status.should.equal(200);
                        // Convert to object and get first task
                        var tasks = JSON.parse(res.text);
                        tasks._id.should.be.ok;
                        tasks.title.should.be.equal('Task Title');
                        tasks.content.should.be.equal('Task Content');
                        tasks.user.name.should.be.equal('Full name');
                        done();
                    });
                });
            });
        });

        describe('not on team that created task', function () {
            before(function (done) {
                user = userTaskHelper.createOtherUser(done);
            });
            before(function (done) {
                loginUser(server, 'test2@test.com', 'password', done);
            });
            it('should deny a user that is not on the team that created the task', function (done) {
                findTask().then(function (taskId) {
                    server
                    .get('/task/' + taskId)
                    .expect(401)
                    .end(function (err, res) {
                        if (err) {
                            return done(err);
                        }
                        res.text.should.be.equal('Unauthorized');
                        done();
                    });
                });
            });
        });
    });
});
