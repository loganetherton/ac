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

// Find a single task
var findMostRecentTask = function () {
    var defer = q.defer();
    Task.findOne({}, function (err, data) {
        if (err) {
            should.not.exist(err);
            defer.reject('Could not find task ID');
        }
        task = data;
        defer.resolve(data._id);
    });
    return defer.promise;
};

/**
 * Global user and task model
 */
var user;
var task;

describe('GET /task/:taskId API', function () {
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
            findMostRecentTask().then(function (taskId) {
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
                findMostRecentTask().then(function (taskId) {
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
                findMostRecentTask().then(function (taskId) {
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

describe('POST /task/:taskId', function () {
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

    describe('unauthenticated', function () {
        it('should deny the user access to update the task', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({title: 'New Title', content: 'New Content'})
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

    describe('not on the team that owns the tasks', function () {
        before(function (done) {
            user = userTaskHelper.createOtherUser(done);
        });
        before(function (done) {
            loginUser(server, 'test2@test.com', 'password', done);
        });
        it('should deny the user access to edit the task', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({title: 'New Title', content: 'New Content'})
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(401);
                    res.text.should.be.equal('Unauthorized');
                    done();
                });
            });
        });
    });

    describe('on the team that owns the task', function () {
        before(function (done) {
            loginUser(server, 'test@test.com', 'password', done);
        });
        it('should return an error if an invalid taskId is requested', function (done) {
            // Create 24 1s, it will match a valid object ID when a snowball rules hell
            var badId = Array.apply(null, Array(24)).map(function(){return 1}).join('');
            server
            .post('/task/' + badId)
            .send({title: 'New Title', content: 'New Content'})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                res.text.should.be.equal('Failed to load task ' + badId);
                done();
            });
        });

        it('should not do anything if neither title or content is updated', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({title: task.title, content: task.content})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    tasks._id.should.be.ok;
                    tasks.title.should.be.equal(task.title);
                    tasks.content.should.be.equal(task.content);
                    // No history shows no update
                    tasks.history.length.should.be.equal(0);
                    done();
                });
            });
        });

        it('should be able to update the title of the task, then return the new task', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({title: 'New Title'})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    tasks._id.should.be.ok;
                    tasks.title.should.be.equal('New Title');
                    tasks.content.should.be.equal('Task Content');
                    done();
                });
            });
        });

        it('should be able to update the content of the task, then return the new task', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({content: 'New Content'})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    tasks._id.should.be.ok;
                    tasks.title.should.be.equal('New Title');
                    tasks.content.should.be.equal('New Content');
                    done();
                });
            });
        });

        it('should be able to update the title and content, then return the new task', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .post('/task/' + taskId)
                .send({content: 'Better Content', title: 'Better Title'})
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    tasks._id.should.be.ok;
                    tasks.title.should.be.equal('Better Title');
                    tasks.content.should.be.equal('Better Content');
                    done();
                });
            });
        });

        it('should have history written to the task for each update', function (done) {
            findMostRecentTask().then(function (taskId) {
                server
                .get('/task/' + taskId)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.status.should.equal(200);
                    var tasks = res.body;
                    tasks._id.should.be.ok;
                    tasks.title.should.be.equal('Better Title');
                    tasks.content.should.be.equal('Better Content');
                    tasks.history.length.should.be.equal(3);
                    done();
                });
            });
        });
    });
});

describe('POST /checkValidObjectId', function () {
    it('should return an error if an ID is invalid', function (done) {
        var badId = Array.apply(null, Array(23)).map(function(){return 1}).join('');
        server
        .post('/checkValidObjectId')
        .send({id: badId})
        .expect(400)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }
            res.text.should.be.equal('Invalid object ID');
            done();
        });
    });

    it('should return success on a valid object ID', function (done) {
        var goodId = Array.apply(null, Array(24)).map(function(){return 1}).join('');
        server
        .post('/checkValidObjectId')
        .send({id: goodId})
        .expect(200)
        .end(function (err, res) {
            if (err) {
                return done(err);
            }
            res.text.should.be.equal('Valid');
            done();
        });
    });
});