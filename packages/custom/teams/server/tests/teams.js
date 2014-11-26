'use strict';

var should = require('should'),
    mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    _ = require('lodash'),
    moment = require('moment');

var team, user;

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
        });
    });
});