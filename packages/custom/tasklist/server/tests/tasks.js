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
 * Clear the tasks collection
 *
 * @returns {Promise.promise|*}
 */
var removeTasks = function () {
    var deferred = q.defer();
    Task.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear tasks collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

/**
 * Clear the users collection
 *
 * @returns {Promise.promise|*}
 */
var removeUsers = function () {
    var deferred = q.defer();
    User.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear users collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

/**
 * Ensures that only a single user and task exist in the database
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
            password: 'password',
            teams: [mongoose.Types.ObjectId()]
        });
        /**
         * Clear the collection
         */
        removeUsers().then(function () {
            user.save(function (err) {
                if (err) {
                    deferred.reject('Could not save user');
                }
                deferred.resolve('Saved user');
            });
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
        task = new Task({
            title: 'Task Title',
            content: 'Task Content',
            user: user,
            team: user.teams[0]
        });
        removeTasks().then(function () {
            task.save(function (err) {
                if (err) {
                    deferred.reject('Failed to save task');
                }
                deferred.resolve('Saved task');
            });
        });
        return deferred.promise;
    };

    /**
     * Create user and task
     */
    q.all([initUsers(), initTasks()]).then(function () {
        done();
    }).fail(function (err) {
        console.log(err);
        should.not.exist(err);
    });
};

/**
 * Create another user
 */
var createOtherUser = function (done) {
    // Create a user
    user = new User({
        name: 'Full name',
        email: 'test2@test.com',
        password: 'password',
        teams: [mongoose.Types.ObjectId()]
    });
    /**
     * Clear the collection
     */
    removeUsers().then(function () {
        user.save(function (err) {
            if (err) {
                throw new Error('Could not create other user');
            }
            done();
        });
    });
};

/**
 * Cleanup the user and task
 * @param done
 */
var removeUserAndTask = function (done) {
    q.all(user.remove(), task.remove()).then(function () {
        done();
    });
};

/**
 * Log the user in
 * @param email
 * @param password
 * @param done
 */
var loginUser = function (email, password, done) {
    server
    .post('/login')
    .send({ email: email, password: password })
    .expect(200)
    .end(function (err, res) {
        if (err) {
            return done(err);
        }
        res.body.user._id.should.be.ok;
        return done();
    });
};

/**
 * Test Suites
 */
describe('Task model', function () {
    beforeEach(function (done) {
        createUserAndTask(done);
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
            task.user = null;

            return task.save(function (err) {
                should.exist(err);
                done();
            });
        });

        it('should be able to show an error when trying to save without a team', function (done) {
            task.team = null;

            return task.save(function (err) {
                should.exist(err);
                done();
            });
        });
    });

    afterEach(function (done) {
        removeUserAndTask(done);
    });
});

describe('GET /tasklist API', function () {
    // Create user and task only once
    before(function (done) {
        createUserAndTask(done);
    });
    // Remove user and task at the end
    after(function (done) {
        // Need to make these async and call done
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

        before(function (done) {
            loginUser('test@test.com', 'password', done);
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
        createUserAndTask(done);
    });
    // Remove user and task at the end
    after(function (done) {
        removeUserAndTask(done);
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
                loginUser('test@test.com', 'password', done);
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
                createOtherUser(done);
            });
            before(function (done) {
                loginUser('test2@test.com', 'password', done);
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

describe('GET /task/user/:userId', function () {
    var firstUserId;

    before(function (done) {
        createUserAndTask(done);
    });

    after(function (done) {
        removeUserAndTask(done);
    });

    describe('unauthenticated user', function () {
        it('should deny unauthenticated users from retrieving tasks', function (done) {
            server
            .get('/tasks/user/' + user._id)
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

    describe('authenticated user, own tasks', function () {
        before(function (done) {
            loginUser('test@test.com', 'password', done);
        });
        it('should prevent the user from querying a non-existant user ID', function (done) {
            // Save a reference to the first user
            firstUserId = user._id;
            server
            .get('/tasks/user/badID')
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.text.should.be.equal('Invalid object ID');
                done();
            });
        });

        it('should allow users to retrieve their own tasks', function (done) {
            server
            .get('/tasks/user/' + user._id)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                var task = res.body[0];
                task.title.should.be.equal('Task Title');
                task.content.should.be.equal('Task Content');
                done();
            });
        });
    });

    describe('authenticated user, others tasks', function () {
        before(function (done) {
            createOtherUser(done);
        });
        before(function (done) {
            loginUser('test2@test.com', 'password', done);
        });
        it('should prevent users from querying the tasklists of others', function (done) {
            server
            .get('/tasks/user/' + firstUserId)
            .expect(400)
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

describe.only('GET /task/team/:teamId', function () {
    before(function (done) {
        createUserAndTask(done);
    });

    after(function (done) {
        removeUserAndTask(done);
    });
    describe('unauthenticated user', function () {
        it('should not allow unauthenticated users to query a teams tasks', function (done) {
            // Make a request to /newTask
            server
            .get('/tasks/team/' + user.teams[0])
            .send(task)
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('User is not authorized');
                return done();
            });
        });
    });

    describe('authenticated user', function () {
        var firstTeamId;
        describe('invalid team', function () {
            before(function (done) {
                loginUser('test@test.com', 'password', done);
            });
            it('should return an error for invalid team query', function (done) {
                // Make a request to /newTask
                server
                .get('/tasks/team/badTeam')
                .send(task)
                .expect(400)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.error.text.should.be.equal('Invalid object ID');
                    return done();
                });
            });
        });
        describe('on team being requested', function () {
            it('should return an error for invalid team query', function (done) {
                firstTeamId = user.teams[0];
                // Make a request to /newTask
                server
                .get('/tasks/team/' + firstTeamId)
                .send(task)
                .expect(200)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    // One task returned in the array
                    res.body.length.should.be.equal(1);
                    var task = res.body[0];
                    // Verify task
                    task.title = 'Task Title';
                    task.content = 'Task Content';
                    return done();
                });
            });
        });
        describe('not on team being requested', function () {
            before(function (done) {
                createOtherUser(done);
            });

            before(function (done) {
                loginUser('test2@test.com', 'password', done);
            });

            it('should not allow the user to query another teams tasks', function (done) {
                server
                .get('/tasks/team/' + firstTeamId)
                .send(task)
                .expect(401)
                .end(function (err, res) {
                    if (err) {
                        return done(err);
                    }
                    res.error.text.should.be.equal('Unauthorized');
                    return done();
                });
            });
        });
    });
});

describe('POST /newTask', function () {
    var task;

    before(function (done) {
        createUserAndTask(done);
    });

    after(function (done) {
        removeUserAndTask(done);
    });

    describe('unauthenticated user', function () {
        before(function (done) {
            task = {
                user: user._id,
                team: user.teams[0],
                title: 'new task',
                content: 'new content'
            };
            done();
        });

        it('should not allow unauthenticated users to create a task', function (done) {
            // Make a request to /newTask
            server
            .post('/newTask')
            .send(task)
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('User is not authorized');
                return done();
            });
        });
    });

    describe('authenticated user', function () {
        before(function (done) {
            loginUser('test@test.com', 'password', done);
        });

        it('should allow authenticated users to create tasks', function (done) {
            // Make a request to /newTask
            server
            .post('/newTask')
            .send(task)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                // Cast to string
                res.body.user.should.be.equal(user._id + '');
                res.body.title.should.be.equal('new task');
                res.body.content.should.be.equal('new content');
                return done();
            });
        });
    });
});