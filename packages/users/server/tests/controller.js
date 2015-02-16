'use strict';

var mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    request = require('supertest'),
    server = request.agent('http://localhost:3000'),
    should = require('should'),
    uuid = require('node-uuid'),
    Promise = require('bluebird');

// Helpers
var userTaskHelper = require('../../../../test/mochaHelpers/userTaskHelpers'),
    loginUser = require('../../../../test/mochaHelpers/loginUser');
// Users
var user, secondUser;
// Helper functions for login/sending invites
var inviteHandler = userTaskHelper.createUserAndSendInvite(server);

describe('User controller', function () {

    describe('POST /register', function () {
        describe('register without registration code', function () {
            beforeEach(function (done) {
                Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
                    done();
                }).catch(function (e) {
                    should.not.exist(e);
                });
            });

            beforeEach(function () {
                user = {
                    name: 'testy tester',
                    email: 'test@test.com',
                    password: 'password'
                };
            });

            it('should require a name for the new user', function (done) {
                delete user.name;
                server
                .post('/register')
                .send({user: user})
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.error.text.should.be.equal('You must enter a name');
                    return done();
                });
            });

            it('should require an email for the new user', function (done) {
                delete user.email;
                server
                .post('/register')
                .send({user: user})
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.error.text.should.be.equal('You must enter a valid email address');
                    return done();
                });
            });

            it('should require a password for the new user', function (done) {
                delete user.password;
                server
                .post('/register')
                .send({user: user})
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.error.text.should.be.equal('You must enter a password');
                    return done();
                });
            });

            it('should require a password that is between 8-100 characters', function (done) {
                user.password = 'a';
                server
                .post('/register')
                .send({user: user})
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.error.text.should.be.equal('Password must be between 8-100 characters long');
                });
                // 101 characters
                user.password = 'fejwiofejoigneffwoignewignwoiengoiewngoiwgnewoingwoignewgoinoewingewoignoiwnoiwnwoignewoignewoignewoi';
                server
                .post('/register')
                .send({user: user})
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.error.text.should.be.equal('Password must be between 8-100 characters long');
                    return done();
                });
            });

            it('should create a user and a team for that user together', function (done) {
                server
                .post('/register')
                .send({user: user})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    var user = res.body.user;
                    // User properties
                    user.name.should.be.equal('testy tester');
                    user.email.should.be.equal('test@test.com');
                    user.roles.length.should.be.equal(1);
                    user.roles[0].should.be.equal('authenticated');
                    // Check team exists
                    user.teams.length.should.be.equal(1);
                    // Query the new team and check name
                    Team.findOne({
                        _id: user.teams[0]
                    }, function (err, team) {
                        team.name.should.be.equal('testy tester\'s Team');
                        done();
                    });
                });
            });
        });
    });

    describe('POST /changeEmail', function () {
        it('should allow the user to change their email address', function (done) {
            done();
        });
    });

    describe('POST /writeInviteToSession', function () {
        var inviteString;
        before(function (done) {
            Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
                done();
            });
        });

        it('should return nothing if no team ID was passed in', function (done) {
            server
            .post('/writeInviteToSession')
            .send({})
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.not.have.property('invitedTeams');
                done();
            });
        });

        it('should return an error if an invalid invite string was passed in', function (done) {
            server
            .post('/writeInviteToSession')
            .send({regCode: 'FAKE'})
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.not.have.property('invitedTeams');
                done();
            });
        });

        it('should return an error if a non-matching invite string was passed in', function (done) {
            inviteString = uuid.v4();
            server
            .post('/writeInviteToSession')
            .send({regCode: inviteString})
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                res.body.should.not.have.property('invitedTeams');
                done();
            });
        });

        describe('existing invite', function () {
            // Create two users and send an invite from each
            before(function (done) {
                inviteHandler.firstUser()
                .then(function (invitingUser) {
                    return inviteHandler.sendInvite(invitingUser, 'otherguy@test.com');
                })
                .then(function (invitingUser) {
                    return inviteHandler.sendInvite(invitingUser);
                })
                .then(inviteHandler.logout)
                .then(function (thisUser) {
                    user = thisUser;
                    return inviteHandler.otherUser();
                })
                // Send an invite that won't be accepted
                .then(function (invitingUser) {
                    return inviteHandler.sendInvite(invitingUser, 'otherguy@test.com');
                })
                // Send invite that will be accepted
                .then(function (invitingUser) {
                    return inviteHandler.sendInvite(invitingUser);
                })
                .then(inviteHandler.logout)
                .then(function (thisUser) {
                    secondUser = thisUser;
                    done();
                }).catch(function (err) {
                    should.not.exist(err);
                })
            });

            it('should save the inviting team to session if a valid string is passed in', function (done) {
                server
                .post('/writeInviteToSession')
                .send({regCode: user.invites[0].inviteString})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('invitedTeams');
                    res.body.invitedTeams.should.have.length(1);
                    res.body.invitedTeams[0].teamId.should.be.equal(user.teams[0].toString());
                    done();
                });
            });

            it('should only save one invite string at a time to session', function (done) {
                server
                .post('/writeInviteToSession')
                .send({regCode: secondUser.invites[1].inviteString})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('invitedTeams');
                    res.body.invitedTeams.should.have.length(1);
                    res.body.invitedTeams[0].teamId.should.be.equal(secondUser.teams[0].toString());
                    done();
                });
            });
        });
    });

    describe('POST /register', function () {
        //var user;

        describe('register with registration code', function () {

            it('should have one invite on the registering users session', function (done) {
                server
                .get('/checkInvitesOnSession')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('invites');
                    res.body.invites.should.be.type('string');
                    res.body.invites.length.should.be.equal(24);
                    done();
                });
            });

            it('should join the teams during registration when teams are on session', function (done) {
                user = {
                    name: 'Evil bad guy',
                    email: 'testThisGuy@test.com',
                    password: 'password'
                };
                server
                .post('/register')
                .send({user: user})
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    // Check that the user is only both teams now
                    res.body.user.teams.length.should.be.equal(2);
                    // Check that the user is on their own team
                    Team.findOne({
                        _id: res.body.user.teams[0]
                    }, function (err, team) {
                        should.not.exist(err);
                        team.name.should.match(/Evil bad guy/);
                        // Check that the user is on the inviting user's team
                        Team.findOne({
                            _id: res.body.user.teams[1]
                        }, function (err, team) {
                            should.not.exist(err);
                            team.name.should.match(/Full name/);
                            done();
                        });
                    });
                });
            });

            it('should remove the invite from the inviting user when it is successfully responded to', function (done) {
                User.findOne({
                    _id: secondUser._id
                }, function (err, thisUser) {
                    should.not.exist(err);
                    thisUser.invites.should.have.length(1);
                    // Check that the right invite was removed
                    done();
                })
            });

            it('should remove an accepted invite from the registering users session', function (done) {
                server
                .get('/checkInvitesOnSession')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.property('invites');
                    res.body.invites.should.be.equal(false);
                    done();
                });
            });

            describe('non-existent team', function () {
                // Delete the user and teams
                before(function (done) {
                    // Clear teams
                    Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
                        // Create first user and send invite
                        return inviteHandler.firstUser()
                        .then(inviteHandler.sendInvite)
                        .then(inviteHandler.logout)
                        .then(function (thisUser) {
                            user = thisUser;
                        })
                    })
                    // Write team to session
                    .then(function () {
                        return new Promise(function (resolve, reject) {
                            server
                            .post('/writeInviteToSession')
                            .send({regCode: user.invites[0].inviteString})
                            .expect(200)
                            .end(function (err, res) {
                                should.not.exist(err);
                                res.body.should.have.property('invitedTeams');
                                res.body.invitedTeams.should.have.length(1);
                                res.body.invitedTeams[0].teamId.should.be.equal(user.teams[0].toString());
                                resolve();
                            });
                        });
                    })
                    // Delete all teams
                    .then(function () {
                        return userTaskHelper.clearTeams()
                    })
                    // done
                    .then(function () {
                        Team.find({}, function (err, teams) {
                            done();
                        });
                    })
                    .catch(function (e) {
                        should.not.exist(e);
                    });
                });

                it('should not join a team which does not exist', function (done) {
                    var secondUser = {
                        email: 'second@test.com',
                        name: 'Second user',
                        password: 'password'
                    };
                    server
                    .post('/register')
                    .send({user: secondUser})
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        // Check that the user is only on one team
                        res.body.user.teams.length.should.be.equal(1);
                        // Check that the user is on their own team
                        Team.findOne({
                            _id: res.body.user.teams[0]
                        }, function (err, team) {
                            should.not.exist(err);
                            team.name.should.match(/Second user/);
                            done();
                        });
                    });
                });
            });

            describe('expired invite', function () {
                before(function (done) {
                    // Clear teams
                    Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
                        // Create first user and send invite
                        return inviteHandler.firstUser()
                    })
                    .then(inviteHandler.sendInvite)
                    .then(inviteHandler.logout)
                    .then(function (thisUser) {
                        user = thisUser;
                    })
                    // Update the invite in the DB so that it is expired
                    .then(function () {
                        return userTaskHelper.setInviteExpired(user);
                    })
                    .then(function () {
                        done();
                    })
                    .catch(function (err) {
                        should.not.exist(err);
                    })
                });

                it('should prevent the user from accepting an invitation that has expired', function (done) {
                    // Write team to session
                    server
                    .post('/writeInviteToSession')
                    .send({regCode: user.invites[0].inviteString})
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.body.should.not.have.property('invitedTeams');
                        res.body.should.have.property('inviteStatus');
                        res.body.inviteStatus.should.be.equal('expired');
                        done();
                    });
                });

                it('should create a notification for the user that they responded to an expired invite', function (done) {
                    done();
                });

                it('should remove the expired invite from the inviting users record', function (done) {
                    User.findById(user._id, function (err, thisUser) {
                        thisUser.invites.should.have.length(0);
                        done();
                    });
                });
            });
        });
    });

    describe('login()', function () {
        // Create user for login
        before(function (done) {
            userTaskHelper.createUserAndTask().then(function (userTask) {
                user = userTask['user'];
                done();
            });
        });

        // Remove the user
        after(function (done) {
            user.remove(function (err, res) {
                should.not.exist(err);
                done();
            });
        });

        it('should not log in the user without an email', function (done) {
            server
            .post('/login')
            .send({ email: null, password: user.password })
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                should.exist(res.error);
                res.error.text.should.be.equal('Bad Request');
                done();
            });
        });

        it('should not allow the user to login without a password', function (done) {
            server
            .post('/login')
            .send({ email: user.email, password: null })
            .expect(400)
            .end(function (err, res) {
                should.not.exist(err);
                should.exist(res.error);
                res.error.text.should.be.equal('Bad Request');
                done();
            });
        });

        it('should not allow the user to login with a bad password', function (done) {
            server
            .post('/login')
            .send({ email: user.email, password: 'badPassword' })
            .expect(401)
            .end(function (err, res) {
                should.not.exist(err);
                should.exist(res.error);
                res.error.text.should.be.equal('Unauthorized');
                done();
            });
        });

        it('should allow the user to login successfully', function (done) {
            loginUser(server, user.email, user.password).then(function () {
                done();
            });
        });

        it('should remove any expired invites from the users record', function (done) {
            done();
        });
    });

    describe('me()', function () {
        // Create a user
        before(function (done) {
            userTaskHelper.createUserAndTask().then(function (userTask) {
                loginUser(server, user.email, user.password).then(function () {
                    done();
                });
            });
        });

        // Remove the user
        after(function (done) {
            user.remove(function (err, res) {
                should.not.exist(err);
                done();
            });
        });

        it('should retrieve the current user', function (done) {
            server
            .get('/users/me')
            .expect(200)
            .end(function (err, res) {
                should.not.exist(err);
                var user = res.body;
                // Name and email
                user.name.should.be.equal('Full name');
                user.email.should.be.equal('test@test.com');
                // Teams
                user.teams.length.should.be.equal(1);
                server.saveCookies(res);
                done();
            });
        });
    });

    describe.only('GET /users/search/:searchTerm', function () {
        var thirdUser;
        var mean = require("meanio");
        before(function (done) {
            mean.events.on('serverStarted', function () {
                done();
            });
        });

        // Create three users
        before(function (done) {
            // Create the first user
            userTaskHelper.createUserAndTeam().then(function (data) {
                user = data.user;
                return userTaskHelper.createOtherUser();
            })
            // Create second user
            .then(function (otherUser) {
                secondUser = otherUser;
                return userTaskHelper.createOtherUser('test3@test.com');
            })
            // Create third user
            .then(function (thisUser) {
                thirdUser = thisUser;
                done();
            })
            // Error handling
            .catch(function (err) {
                should.not.exist(err);
            });
        });

        describe('unauthenticated', function () {
            it('should deny requests to unauthenticated users', function (done) {
                server
                .get('/users/search/shouldNotWork')
                .expect(401)
                .end(function (err, res) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        describe('authenticated', function () {
            // Log the first user in
            before(function (done) {
                loginUser(server, 'test@test.com', 'password').then(function () {
                    done();
                });
            });

            it('should not return results for queries shorter than 3 characters', function (done) {
                server
                .get('/users/search/a')
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body[0].param.should.be.equal('searchTerm');
                    res.body[0].msg.should.be.equal('Query must be between 3 and 100 characters');
                    done();
                });
            });

            it('should not allow queries that are above 100 characters', function (done) {
                server
                .get('/users/search/' + userTaskHelper.createString(101))
                .expect(400)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body[0].param.should.be.equal('searchTerm');
                    res.body[0].msg.should.be.equal('Query must be between 3 and 100 characters');
                    done();
                });
            });

            it('should be able to find users by name (and not return the current user)', function (done) {
                server
                .get('/users/search/full')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.length(2);
                    res.body[0].name.should.be.equal('Full name2 <test2@test.com>');
                    res.body[1].name.should.be.equal('Full name3 <test3@test.com>');
                    done();
                });
            });

            it('should be able to find users by email', function (done) {
                server
                .get('/users/search/test2@test.com')
                .expect(200)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.body.should.have.length(1);
                    res.body[0].name.should.be.equal('Full name2 <test2@test.com>');
                    done();
                });
            });

            it('should not return users already on this users team', function (done) {
                user.teams.push(secondUser.teams[0]);
                // Add the second user to the first user's team
                secondUser.teams.push(user.teams[0]);
                secondUser.save(function (err) {
                    should.not.exist(err);
                    // Search for the second user
                    server
                    .get('/users/search/test2@test.com')
                    .expect(200)
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.body.should.have.length(0);
                        done();
                    });
                });
            });
        });
    });
});