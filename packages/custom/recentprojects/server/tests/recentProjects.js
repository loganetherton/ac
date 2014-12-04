var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    q = require('q');

var request = require('supertest');
var server = request.agent('http://localhost:3000');

// Helpers
var userTaskHelper = require('../../../../../test/mochaHelpers/initUserAndTasks'),
    loginUser = require('../../../../../test/mochaHelpers/loginUser');

/**
 * Global user and task model
 */
var user;
var task;

describe('GET /recentTasks', function () {
    // Create user and tasks
    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
        });
    });

    // Remove users and tasks
    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
    });

    describe('unauthenticated', function () {
        it('should deny unauthenticated requests', function (done) {
            server
            .get('/recentTasks')
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(401);
                res.error.text.should.be.equal('User is not authorized');
                done();
            });
        });
    });

    describe('authenticated', function () {
        beforeEach(function (done) {
            loginUser(server, 'test@test.com', 'password', done);
        });

        it('should retrieve as many tasks as possible if there are less than five', function (done) {
            userTaskHelper.createTask(1, user).then(function () {
                server
                .get('/recentTasks')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    // Two tasks
                    tasks.length.should.be.equal(2);
                    // Most recent
                    tasks[0].title.should.be.equal('Task Title0');
                    tasks[0].content.should.be.equal('Task Content0');
                    // Oldest
                    tasks[1].title.should.be.equal('Task Title');
                    tasks[1].content.should.be.equal('Task Content');
                    done();
                });
            });
        });

        it('should retrieve the 5 most recently modified tasks for the current user by id DESC', function (done) {
            userTaskHelper.createTask(9, user).then(function () {
                server
                .get('/recentTasks')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    // Two tasks
                    tasks.length.should.be.equal(5);
                    tasks[0].title.should.be.equal('Task Title8');
                    done();
                });
            });
        });

        it('should request the next five tasks on pagination', function (done) {
            server
            .get('/recentTasks/2')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(200);
                var tasks = res.body;
                tasks[0].title.should.be.equal('Task Title3');
                // Two tasks
                tasks.length.should.be.equal(5);
                done();
            });
        });

        it('should return an empty array if there are no tasks', function (done) {
            userTaskHelper.removeTasks().then(function () {
                server
                .get('/recentTasks/2')
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    // Two tasks
                    tasks.length.should.be.equal(0);
                    done();
                });
            });
        });
    });
});