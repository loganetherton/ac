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
    /**
     * Clear the users collection and create a test user
     *
     * @returns {Promise.promise|*}
     */
    var initUsers = function () {
        var deferred = q.defer();
        // Create a user
        user = new User({
            name: 'Full name',
            email: 'test@test.com',
            username: 'user',
            password: 'password'
        });
        /**
         * Clear the collection
         */
        //deferred.reject('Could not save user');
        User.remove({}, function (err) {
            if (err) {
                deferred.reject('Could not clear users collection');
            }
        });
        user.save(function (err) {
            if (err) {
                deferred.reject('Could not save user');
            }
            deferred.resolve('Saved user');
        });
        return deferred.promise;
    };

    /**
     * Clear the tasks collection and create a test task
     *
     * @returns {Promise.promise|*}
     */
    var initTasks = function () {
        var deferred = q.defer();
        Task.remove({}, function (err) {
            if (err) {
                deferred.reject('Could not clear tasks collection');
            }
        });
        task = new Task({
            title: 'Task Title',
            content: 'Task Content',
            user: user
        });
        task.save(function (err) {
            if (err) {
                deferred.reject('Failed to save task');
            }
            deferred.resolve('Saved task');
        });
        return deferred.promise;
    };

    /**
     * Create user and task
     */
    q.all([initUsers().then(function () {
        //console.log('saved user');
    }), initTasks().then(function () {
        //console.log('saved task');
    })]).then(function () {
        //console.log('all promises resolved');
        done();
    }).fail(function (err) {
        console.log(err);
        should.not.exist(err);
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
        it('should be able to save a task', function (done) {
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