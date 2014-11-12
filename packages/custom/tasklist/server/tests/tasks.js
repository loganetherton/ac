'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    q = require('q');

var request = require('supertest');
var server = request.agent('http://localhost:3000');

/**
 * Globals
 */
var user;
var task;

/**
 * Create a user and a task
 *
 * @param done
 */
var createUserAndTask = function (done) {
    var saveUser = function () {
        var deferred = q.defer();
        // Create a user
        user = new User({
            name: 'Full name',
            email: 'test@test.com',
            username: 'user',
            password: 'password'
        });
        user.save(function (err) {
            if (err) {
                deferred.reject('Failed to save user');
            } else {
                deferred.resolve('Saved user');
            }
        });
        return deferred.promise;
    };

    var saveTask = function () {
        var deferred = q.defer();
        task = new Task({
            title: 'Task Title',
            content: 'Task Content',
            user: user
        });
        task.save(function (err) {
            if (err) {
                deferred.reject('Failed to save task');
            } else {
                deferred.resolve('Saved task');
            }
        });
        return deferred.promise;
    };

    // Save user, then task
    saveUser().then(function (success) {
        console.log('save user success');
        return saveTask();
    }, function (error) {
        console.error(error);
        should.not.exist(error);
    }).then(function (success) {
        console.log('save task success');
        return done();
    }, function (error) {
        console.error(error);
        should.not.exist(error);
    });
};

// Single requests are made with describe.only

/**
 * Test Suites
 */
describe('Task model', function () {
    beforeEach(function (done) {
        return createUserAndTask(done);
    });

    describe('Task model save', function () {
        it('should be able to save without problems', function (done) {
            return task.save(function (err) {
                should.not.exist(err);
                task.title.should.equal('Task Title');
                task.content.should.equal('Task Content');
                task.user.should.not.have.length(0);
                task.created.should.not.have.length(0);
                done();
            });
        });

        it('should be able to show an error when try to save without title', function (done) {
            task.title = '';

            return task.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without content', function (done) {
            task.content = '';

            return task.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when try to save without user', function (done) {
            task.user = {};

            return task.save(function (err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function (done) {
        user.remove();
        task.remove();
        done();
    });
});

describe('GET /tasklist API', function () {
    // Create user and task only once
    before(function (done) {
        createUserAndTask(done);
    });
    // Remove user and task at the end
    after(function (done) {
        user.remove();
        task.remove();
        done();
    });

    describe('GET /tasklist unauthenticated', function () {
        it('should deny unauthenticated requests to /tasklist', function (done) {
            server
            .get('/tasklist')
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(401);
                done();
            });
        });
    });

    describe('GET /tasklist authenticated', function () {
        var cookie;
        it('should allow the user to login', function (done) {
            server
            .post('/login')
            .send({ email: 'test@test.com', password: 'password' })
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.body.user._id.should.be.ok;
                cookie = res.headers['set-cookie'];
                return done();
            });
        });

        it('should allow authenticated requests to /tasklist and return the tasklist', function (done) {
            server
            .get('/tasklist')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(200);
                // Convert to object and get first task
                var tasks = JSON.parse(res.text)[0];
                tasks._id.should.be.ok;
                tasks.title.should.be.equal('Task Title');
                tasks.content.should.be.equal('Task Content');
                tasks.user.name.should.be.equal('Full name');
                done();
            });
        });
    });
});