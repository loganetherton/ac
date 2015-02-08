'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    moment = require('moment');

var team, user, task;

// Superagent
var request = require('supertest'),
    server = request.agent('http://localhost:3000');

// Helpers
var userTaskHelper = require('../../../../../test/mochaHelpers/userTaskHelpers'),
    loginUser = require('../../../../../test/mochaHelpers/loginUser');

// Helper functions for login/sending invites
var inviteHandler = userTaskHelper.createUserAndSendInvite(server);

describe('Team model', function () {

    before(function (done) {
        team = {};
        user = {
            name: 'Full name',
            email: 'test@test.com',
            teams: [mongoose.Types.ObjectId()],
            password: 'password',
            provider: 'local'
        };
        done();
    });

    after(function (done) {
        team.remove();
        done();
    });

    describe('save', function () {
        it('should have no teams in the database at the beginning of this test', function (done) {
            Team.remove({}, function (err) {
                should.not.exist(err);
                done();
            });
        });

        it('should require a name for the team', function (done) {
            var _team = new Team(team);
            _team.save(function (err) {
                // Make sure it won't save
                should.exist(err);
                // Set name and save
                _team.name = 'great team';
                _team.save(function (err) {
                    // Save successful
                    should.not.exist(err);
                    // Delete team
                    _team.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should set the default userCount value to 0', function (done) {
            // Create a team
            team.name = 'A very good team';
            var _team = new Team(team);
            _team.save(function (err) {
                should.not.exist(err);
                _team.userCount.should.equal(0);
                // Remove team
                _team.remove(function (err) {
                    should.not.exist(err);
                    done();
                });
            });
        });

        it('should only allow numbers to be saved for userCount', function (done) {
            // Create a team
            team.name = 'A very good team';
            team.userCount = 'a';
            var _team = new Team(team);
            _team.save(function (err) {
                should.exist(err);
                // Set to a number and save
                _team.userCount = team.userCount = 1;
                _team.save(function (err) {
                    should.not.exist(err);
                    // Remove team
                    _team.remove(function (err) {
                        should.not.exist(err);
                        done();
                    });
                });
            });
        });

        it('should set modified to the current datetime', function (done) {
            var _team = new Team(team);
            _team.save(function (err) {
                should.not.exist(err);
                // Verify that the time can be parsed
                moment(_team.modified)._i.should.be.equal(_team.modified);
                done();
            });
            // Don't even know why I wrote it this way
            team = _team;
        });
    });
});

describe('GET /team/:teamId', function () {
    // Create user and task only once
    before(function (done) {
        userTaskHelper.createUserAndTeam().then(function (userTask) {
            user = userTask['user'];
            team = userTask['team'];
            done();
        });
    });
    // Remove user and task at the end
    after(function (done) {
        // Need to make these async and call done
        user.remove();
        team.remove();
        done();
    });

    describe('unauthenticated', function () {
        it('should deny unauthenticated requests', function (done) {
            server
            .get('/team/' + user.teams[0])
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

    describe('authenticated', function () {
        before(function (done) {
            loginUser(server, 'test@test.com', 'password').then(function () {
                done();
            });
        });

        it('should prevent the user from passing in a invalid object ID', function (done) {
            server
            .get('/team/fakeAsHell')
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                done();
            });
        });

        it('should deny users if they do not belong to the team that is requested', function (done) {
            server
            .get('/team/' + userTaskHelper.createFakeObjectId())
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(401);
                done();
            });
        });

        it('should allow users to retrieve information on their own teams', function (done) {
            server
            .get('/team/' + user.teams[0])
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(200);
                res.body.name.should.equal('Full name\'s team');
                done();
            });
        });
    });
});

var secondUser, thirdUser;

describe('POST /inviteToTeam', function () {
    // Create user and task only once
    before(function (done) {
        // Create a fake user and task
        userTaskHelper.createUserAndTask().then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
            done();
        });
    });

    before(function (done) {
        userTaskHelper.createOtherUser().then(function (response) {
            secondUser = response;
            return userTaskHelper.createOtherUser('test3@test.com');
        }).then(function (response) {
            thirdUser = response;
            done();
        });
    });
    // Remove user and task at the end
    after(function (done) {
        userTaskHelper.removeUsersAndTasks().then(function () {
            done();
        });
    });

    describe('Unauthenticated', function () {
        it('should deny unauthenticated requests to /inviteToTeam', function (done) {
            server
            .post('/inviteToTeam')
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

    describe('Authenticated', function () {
        before(function (done) {
            loginUser(server, 'test@test.com', 'password').then(function () {
                done();
            });
        });

        it('should deny requests which do not have a team ID passed in', function (done) {
            server
            .post('/inviteToTeam')
            .send({})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                done();
            });
        });

        it('should deny requests that do not have an email address', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0]})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                done();
            });
        });

        it('should deny requests for teams to which the user does not belong', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: userTaskHelper.createFakeObjectId(), email: 'fake@fake.com'})
            .expect(401)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(401);
                done();
            });
        });

        it('should deny requests for invalid emails', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0], email: 'NOTANEMAIL'})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                done();
            });
        });

        it('should deny requests to invite yourself', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0], email: user.email})
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(400);
                done();
            });
        });

        it('should invite users who have an account to join this team', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0], email: secondUser.email})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(200);
                // Check message sent
                res.text.should.match(/Message sent/);
                // From
                res.text.should.match(/From: Logan Etherton <logan@loganswalk.com>/);
                // To
                res.text.should.match(/To: test2@test.com/);
                // Body text
                res.text.should.match(/<p>You've been invited to join Full name's team<\/p>/);
                userTaskHelper.checkInvites(1, user, done);
            });
        });

        it('should invite users who do not have an account to join this team', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0], email: 'newguy@test.com'})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.status.should.equal(200);
                // Make sure the email requests sign up
                res.text.should.match(/<p>But first you have to sign up!<\/p>/);
                userTaskHelper.checkInvites(2, user, done);
            });
        });

        it('should prevent the user from sending multiple emails to the same address', function (done) {
            server
            .post('/inviteToTeam')
            .send({teamId: user.teams[0], email: 'newguy@test.com'})
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                // Make sure the email requests sign up
                res.text.should.equal('This user has already received an invite from you');
                userTaskHelper.checkInvites(2, user, done);
            });
        });

        it('should deny requests to users already on this team', function (done) {
            // Add second user to first user's team
            thirdUser.teams.push(user.teams[0]);
            thirdUser.save(function (err, thirdUser) {
                if (err) {
                    return done(err);
                }
                server.post('/inviteToTeam').send({
                    teamId: user.teams[0],
                    email: thirdUser.email
                }).expect(200).end(function (err, res) {
                    if (err) {
                        should.not.exist(err);
                        return done(err);
                    }
                    res.status.should.equal(200);
                    res.text.should.equal('This user is already on this team');
                    userTaskHelper.checkInvites(2, user, done)
                });
            });
        });

        // @todo
        it('should create a notification for an existing user to allow them to join a team internally', function (done) {
            done();
        });
    });
});

describe.only('GET joinTeamWithInvite/:invite', function () {
    var mean = require("meanio");
    before(function (done) {
        mean.events.on('serverStarted', function () {
            done();
        });
    });

    // Create a user that will receive the invite
    before(function (done) {
        userTaskHelper.createUserAndTeam().then(function (thisUser) {
            user = thisUser.user;
            return userTaskHelper.createUserAndTeam(false, 'test2@test.com');
        }).then(function (thisUser) {
            secondUser = thisUser.user;
            done();
        });
    });

    it('should deny requested to unauthenticated users', function (done) {
        done();
    });

    describe('invite not found', function () {
        it('should return null if no invite code was sent', function (done) {
            done();
        });

        it('should return an error message if an invite invite string was passed in', function (done) {
            done();
        });

        it('should return an error message if the invite was not found', function (done) {

        });
    });

    describe('invite found', function () {
        // Log in the first user and send invite to the second user
        before(function (done) {
            loginUser(server, 'test@test.com', 'password').then(function () {
                // Send invite
                return inviteHandler.sendInviteAndLogout(user, secondUser.email);
            }).then(function () {
                done();
            });
        });

        it('should have both users created and an invite sent', function (done) {
            User.find({}, function (err, users) {
                should.not.exist(err);
                // Check both users exists
                users[0].email.should.be.equal('test@test.com');
                users[1].email.should.be.equal('test2@test.com');
                // Check invite created
                users[0].invites.should.have.length(1);
                users[0].invites[0].invitedEmail.should.be.equal('test2@test.com');
            });
            done();
        });

        it('should allow the user to join the team to which they were invited', function (done) {
            done();
        });

        it('should remove the invite from the inviting users record on accepted', function (done) {
            done();
        });

        it('should prevent a user from joining a team multiple times', function (done) {
            done();
        });

        it('should prevent users from accepting expired invites', function (done) {
            done();
        });
    });
});