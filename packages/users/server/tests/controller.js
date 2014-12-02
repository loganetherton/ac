'use strict';

var mongoose = require('mongoose'),
    Team = mongoose.model('Team'),
    User = mongoose.model('User'),
    q = require('q'),
    request = require('supertest'),
    server = request.agent('http://localhost:3000'),
    should = require('should');

var user;

// Clear the users collection
var clearUsers = function () {
    var deferred = q.defer();
    User.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear users collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

// Clear the teams collection
var clearTeams = function () {
    var deferred = q.defer();
    Team.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear teams collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

/**
 * Ensures that only a single user exists in the database
 *
 * @param done
 */
var createUser = function (done) {
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
        clearUsers().then(function () {
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
     * Create user and task
     */
    initUsers().then(function () {
        done();
    }).fail(function (err) {
        should.not.exist(err);
    });
};

/**
 * Successful login attempt
 * @param done
 */
var loginUser = function (done) {
    server
    .post('/login')
    .send({ email: user.email, password: user.password })
    .expect(200)
    .end(function (err, res) {
        should.not.exist(err);
        // Check the user
        var user = res.body.user;
        should.exist(user);
        user.name.should.be.equal('Full name');
        user.email.should.be.equal('test@test.com');
        user.teams.length.should.be.equal(1);
        user.roles[0].should.be.equal('authenticated');
        // Check redirect
        res.body.redirect.should.be.equal('site.tasklist');
        done();
    });
};


describe('User controller', function () {
    describe('create()', function () {
        var user;

        beforeEach(function (done) {
            q.all([clearTeams(), clearUsers()]).then(function () {
                done();
            });
        });

        beforeEach(function () {
            user = {
                name: 'testy tester',
                email: 'test@test.com',
                password: 'password',
                confirmPassword: 'password'
            };
        });

        it('should require a name for the new user', function (done) {
            delete user.name;
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('You must enter a name');
                return done();
            });
        });

        it('should require an email for the new user', function (done) {
            delete user.email;
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('You must enter a valid email address');
                return done();
            });
        });

        it('should require a password for the new user', function (done) {
            delete user.password;
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('You must enter a password');
                return done();
            });
        });

        it('should require a password that is between 8-100 characters', function (done) {
            user.password = 'a';
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('Password must be between 8-100 characters long');
            });
            // 101 characters
            user.password = 'fejwiofejoigneffwoignewignwoiengoiewngoiwgnewoingwoignewgoinoewingewoignoiwnoiwnwoignewoignewoignewoi';
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('Password must be between 8-100 characters long');
                return done();
            });
        });

        it('should require a matching confirm password for the new user', function (done) {
            user.confirmPassword = 'badPassword';
            server
            .post('/register')
            .send(user)
            .expect(400)
            .end(function (err, res) {
                if (err) {
                    return done(err);
                }
                res.error.text.should.be.equal('Passwords do not match');
                return done();
            });
        });

        it('should create a user and a team for that user together', function (done) {
            server
            .post('/register')
            .send(user)
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    should.not.exist(err);
                    return done(err);
                }
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

    describe('login()', function () {
        // Create user for login
        before(function (done) {
            createUser(done);
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
            loginUser(done);
        });
    });

    describe('me()', function () {
        // Create a user
        before(function (done) {
            createUser();
            loginUser(done);
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