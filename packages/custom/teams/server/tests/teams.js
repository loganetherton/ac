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

describe('POST /team/:teamId', function () {
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
            // @todo Don't be an idiot
            // I have to call team[1] because I wrote the helper scripts in a shitty way that required
            // that I add the team manually. Need to revise, duh.
            .get('/team/' + user.teams[1])
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

describe('Invite to a team', function () {
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

    describe('POST /inviteToTeam', function () {
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
});