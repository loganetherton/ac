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
var userTaskHelper = require('../../../../test/mochaHelpers/initUserAndTasks'),
    loginUser = require('../../../../test/mochaHelpers/loginUser');
// Users
var user, secondUser;
// Helper functions
var clearUsers, clearTeams, createUserAndSendInvite, inviteHandler;

// Clear the users collection
clearUsers = function () {
    return new Promise(function (resolve, reject) {
        User.remove({}, function (err) {
            if (err) {
                reject('Could not clear users collection');
            }
        });
        resolve('tasks cleared');
    });
};

// Clear the teams collection
clearTeams = function () {
    return new Promise(function (resolve, reject) {
        Team.remove({}, function (err) {
            if (err) {
                reject('Could not clear teams collection');
            }
            resolve('tasks cleared');
        });
    });
};

/**
 * Create users, invite, and logout each
 * @returns {{firstUser: Function, sendInviteAndLogout: Function, otherUser: Function}}
 */
createUserAndSendInvite = function () {
    return {
        // Create first user, send invite, logout
        firstUser: function () {
            // Create the first user
            return userTaskHelper.createUserAndTask().then(function (userTask) {
                // Log the first user in
                user = userTask['user'];
                return loginUser(server, user.email, user.password);
            })
            .then(this.sendInviteAndLogout)
            .then(function (invitingUser) {
                user = invitingUser;
            });
        },
        // Send invite for this user, then logout
        sendInviteAndLogout: function (invitingUser) {
            // Create an invite using the first user
            return userTaskHelper.sendInvite(server, invitingUser)
                // Log the first user out
            .then(function (thisUser) {
                return new Promise(function (resolve, reject) {
                    server
                    .get('/logout')
                    .expect(302)
                    .end(function (err, res) {
                        should.not.exist(err);
                        resolve(thisUser);
                    });
                });
            })
        },
        // Create a second user, send an invite, logout
        otherUser: function () {
            // Create a second user
            return userTaskHelper.createOtherUser(null, 'test2@test.com', true)
                // Log the second user in
            .then(function (thisUser) {
                secondUser = thisUser;
                return loginUser(server, secondUser.email, secondUser.password);
            })
                // Send the invite and log the user out
            .then(this.sendInviteAndLogout)
                // Keep reference to the second user
            .then(function (invitingUser) {
                secondUser = invitingUser;
            });
        }
    };
};

inviteHandler = createUserAndSendInvite();

describe('User controller', function () {

    describe('POST /register', function () {
        describe('register without registration code', function () {
            beforeEach(function (done) {
                Promise.all([clearTeams(), clearUsers()]).then(function () {
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
            Promise.all([clearTeams(), clearUsers()]).then(function () {
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
                inviteHandler.firstUser().then(function () {
                    return inviteHandler.otherUser();
                }).then(function () {
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
                .send({regCode: secondUser.invites[0].inviteString})
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
                    thisUser.invites.should.have.length(0);
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
                    Promise.all([clearTeams(), clearUsers()]).then(function () {
                        // Create first user and send invite
                        return inviteHandler.firstUser()
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
                        return clearTeams()
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
                    Promise.all([clearTeams(), clearUsers()]).then(function () {
                        // Create first user and send invite
                        return inviteHandler.firstUser();
                    })
                    // Update the invite in the DB so that it is expired
                    .then(function () {
                        return new Promise(function (resolve, reject) {
                            var date = new Date();
                            // Expired yesterday
                            date.setDate(date.getDate() - 1);
                            user.invites[0].expires = date;
                            user.save(function (err, thisUser) {
                                if (err) {
                                    return reject(err);
                                }
                                return resolve();
                            });
                        });
                    })
                    .then(function () {
                        done();
                    });
                });

                after(function (done) {
                    Promise.all([clearTeams(), clearUsers()]).then(function () {
                        done();
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
});