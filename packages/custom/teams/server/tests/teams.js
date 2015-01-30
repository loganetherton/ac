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
var userTaskHelper = require('../../../../../test/mochaHelpers/initUserAndTasks'),
    loginUser = require('../../../../../test/mochaHelpers/loginUser');

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
        userTaskHelper.createUserAndTeam(done).then(function (userTask) {
            user = userTask['user'];
            team = userTask['team'];
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
            loginUser(server, 'test@test.com', 'password', done);
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
        userTaskHelper.createUserAndTask(done).then(function (userTask) {
            user = userTask['user'];
            task = userTask['task'];
        });
    });

    before(function (done) {
        secondUser = userTaskHelper.createOtherUser();
        thirdUser = userTaskHelper.createOtherUser(done, 'test3@test.com');
    });
    // Remove user and task at the end
    after(function (done) {
        userTaskHelper.removeUsersAndTasks(done);
        done();
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
            loginUser(server, 'test@test.com', 'password', done);
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
    });
});