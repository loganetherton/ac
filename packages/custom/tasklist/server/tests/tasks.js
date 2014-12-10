'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    q = require('q');

// Superagent
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

/**
 * Test Suites
 */
describe('Task model', function () {
    beforeEach(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });

    describe('Task model save', function () {
        it('should be able to save a task', function (done) {
            return task.save(function (err) {
                should.not.exist(err);
                task.title.should.equal('Task Title');
                task.content.should.equal('Task Content');
                task.user.should.not.have.length(0);
                task.modified.should.not.have.length(0);
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

        it('should modify the modified time on saving the task', function (done) {
            // Get original time
            var originalModified = task.modified;
            // Delay things by a second
            var wasteSomeTime = function () {
                var deferred = q.defer();
                setTimeout(function () {
                    deferred.resolve();
                }, 1000);
                return deferred.promise;
            };
            wasteSomeTime().then(function () {
                // Check against new time to make sure it's been modified
                task.save(function (err) {
                    should.not.exist(err);
                    originalModified.toString().should.not.be.equal(task.modified.toString());
                    done();
                });
            });
        });

        it('should be able to retrieve the most recent tasks for a user', function (done) {
            userTaskHelper.createTask(5, user).then(function () {
                //Task.getMostRecent(user._id, 5, function (err, tasks) {
                Task.getMostRecent(user._id, 5, function (err, tasks) {
                    tasks.length.should.be.equal(5);
                    done();
                });
            });
        });
    });

    afterEach(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
    });
});

describe('GET /tasklist API', function () {
    // Create user and task only once
    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
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
            loginUser(server, 'test@test.com', 'password', done);
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

describe('GET /task/user/:userId', function () {
    var firstUserId;

    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });

    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
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
            loginUser(server, 'test@test.com', 'password', done);
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
            user = userTaskHelper.createOtherUser(done);
        });
        before(function (done) {
            loginUser(server, 'test2@test.com', 'password', done);
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

describe('GET /task/team/:teamId', function () {
    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });

    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
    });
    describe('unauthenticated user', function () {
        it('should not allow unauthenticated users to query a teams tasks', function (done) {
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
                loginUser(server, 'test@test.com', 'password', done);
            });
            it('should return an error for invalid team query', function (done) {
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
                user = userTaskHelper.createOtherUser(done);
            });

            before(function (done) {
                loginUser(server, 'test2@test.com', 'password', done);
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
    before(function (done) {
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });

    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done, user, task);
    });

    describe('unauthenticated user', function () {
        var task;
        before(function (done) {
            task = {
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
        var task;
        before(function (done) {
            task = {
                title: 'new task',
                content: 'new content'
            };
            done();
        });
        before(function (done) {
            loginUser(server, 'test@test.com', 'password', done);
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

describe.only('Tasklist socket', function () {
    var io = require('socket.io-client');
    var options ={
        transports: ['websocket'],
        'force new connection': true
    };
    //var socketURL = 'http://0.0.0.0:3000/task';
    var socketURL = 'http://localhost:3000/task';
    var client1;
    beforeEach(function (done) {
        setTimeout(function () {
            done();
        }, 1800);
    });
    beforeEach(function () {
        //client1 = io.connect(socketURL, options);
        var client1 = io.connect('http://localhost:3000/task');
        console.log('*******************CLIENT.IO***************');
        console.log(client1);
    });
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

    describe('emit new task', function () {
        it('should be able to connect to the socket', function (done) {

            client1.on('connect', function(data){
                console.log(data);
                console.log('client connected');
                //client1.emit('connection name', chatUser1);
                //
                ///* Since first client is connected, we connect
                // the second client. */
                //var client2 = io.connect(socketURL, options);
                //
                //client2.on('connect', function(data){
                //    client2.emit('connection name', chatUser2);
                //});
                //
                //client2.on('new user', function(usersName){
                //    usersName.should.equal(chatUser2.name + " has joined.");
                //    client2.disconnect();
                //});
                done();
            });

            //var numUsers = 0;
            //client1.on('new user', function(usersName){
            //    numUsers += 1;
            //
            //    if(numUsers === 2){
            //        usersName.should.equal(chatUser2.name + " has joined.");
            //        client1.disconnect();
            //        done();
            //    }
            //});
            //done();
        });
    });
});