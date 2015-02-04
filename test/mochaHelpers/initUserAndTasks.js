var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    Team = mongoose.model('Team'),
    q = require('q'),
    Promise = require('bluebird');

var user, task, team;
var deferred;

/**
 * Clear the tasks collection
 *
 * @returns {Promise.promise|*}
 */
var removeTasks = exports.removeTasks = function () {
    return new Promise(function (resolve, reject) {
        Task.remove({}, function (err) {
            if (err) {
                reject('Could not clear tasks collection');
            }
        });
        resolve('Tasks collection cleared');
    });
};

/**
 * Clear the users collection
 *
 * @returns {Promise.promise|*}
 */
var removeUsers = function () {
    return new Promise(function (resolve, reject) {
        User.remove({}, function (err) {
            if (err) {
                reject('Could not clear users collection');
            }
        });
        resolve('Users collection cleared');
    });
};

/**
 * Remove any teams currently in the DB
 * @returns {promise.promise|jQuery.promise|promise|Q.promise|jQuery.ready.promise|qFactory.Deferred.promise|*}
 */
var removeTeams = function () {
    var deferred = q.defer();
    Team.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear teams collection');
        }
    });
    deferred.resolve('teams cleared');
    return deferred.promise;
};

/**
 * Create another user
 *
 * Poor planning, ugh
 */
exports.createOtherUser = function (done, email, defer) {
    var deferred = q.defer();
    email = email || 'test2@test.com';
    // Create a user
    user = new User({
        name: 'Full name',
        email: email,
        password: 'password'
    });
    // Create a team for this user
    team = new Team({
        name: user.name + '\'s team'
    });
    // Save the team
    team.save(function (err) {
        if (err) {
            new Error('Could not save team');
        }
        // Add user to team
        user.teams.push(team._id);
        // Save the user
        user.save(function (err) {
            if (err) {
                new Error('Could not save user');
            }
            // Call done if necessary
            if (typeof done === 'function') {
                done();
            }
            deferred.resolve(user);
        });
    });
    if (defer) {
        return deferred.promise;
    }
    return user;
};

/**
 * Create a task
 *
 * @returns {Promise.promise|*}
 */
var createTask = exports.createTask = function (taskCount, thisUser) {
    var deferred = q.defer();
    var taskTitle = 'Task Title',
        taskContent = 'Task Content';

    var makeSingleTask = function () {
        // Set the user
        if (typeof thisUser !== 'undefined') {
            user = thisUser;
        }
        // Create task
        task = new Task({
            title: taskTitle,
            content: taskContent,
            user: user,
            team: user.teams[0]
        });
        task.save(function (err) {
            if (err) {
                deferred.reject('Failed to save task');
            }
            deferred.resolve('Saved task');
        });
    };

    // For iteration
    if (typeof taskCount !== 'undefined') {
        for (var i = 0; i < taskCount; i++) {
            taskTitle = 'Task Title' + i;
            taskContent = 'Task Content' + i;
            makeSingleTask();
        }
    // Make single task
    } else {
        makeSingleTask();
    }

    return deferred.promise;
};

/**
 * Clear the users collection and create a test user
 *
 * @returns {Promise.promise|*}
 */
var initUsers = function () {
    var deferred = q.defer();
    // Create user
    user = new User({
        name: 'Full name',
        email: 'test@test.com',
        password: 'password'
    });
    // Create a team for this user
    team = new Team({
        name: user.name + '\'s team'
    });
    // Save the team
    team.save(function (err) {
        if (err) {
            deferred.reject('Could not save team');
        }
        // Add user to team
        user.teams.push(team._id);
        // Save the user
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
 * Ensures that only a single user and task exist in the database
 *
 * @param done
 */
exports.createUserAndTask = function (done) {
    return new Promise(function (resolve, reject) {
        removeUsersAndTasks().then(function () {
            /**
             * Create user and task
             */
            var init = initUsers().then(function () {
                return createTask();
            });
            init.then(function () {
                // Send back the user and task
                resolve({
                    user: user,
                    task: task
                });
                if (typeof done === 'function') {
                    done();
                }
            }, function (err) {
                console.log(err);
                should.not.exist(err);
            });
        });
    });
};

/**
 * Ensures that only a single user and task exist in the database
 *
 * @param done
 */
exports.createUserAndTeam = function (done) {
    deferred = q.defer();
    removeUsersAndTeams().then(function () {
        /**
         * Create user and task
         */
        initUsers().then(function () {
            deferred.resolve({
                user: user,
                team: team
            });
            if (typeof done === 'function') {
                done();
            }
        }).fail(function (err) {
            console.log(err);
            should.not.exist(err);
        });
    });
    return deferred.promise;
};

/**
 * Remove all users and tasks from DB
 * @param done
 */
var removeUsersAndTasks = exports.removeUsersAndTasks = function (done) {
    Promise.all([removeUsers(), removeTasks()]).then(function () {
        if (typeof done !== 'undefined') {
            done();
        }
    });
};

removeUsersAndTasks = Promise.promisify(removeUsersAndTasks);

/**
 * Cleanup the user and task
 * @param done
 */
var removeUsersAndTeams = exports.removeUsersAndTeams = function (done) {
    var deferred = q.defer();
    q.all(removeUsers(), removeTeams()).then(function () {
        deferred.resolve();
        if (typeof done !== 'undefined') {
            done();
        }
    });
    return deferred.promise;
};

/**
 * Create a random string for invites or fake object IDs
 * @param length
 * @returns {*|Socket|string}
 */
var createString = function (length) {
    var possible = 'abcdef0123456789';
    return Array.apply(null, Array(length)).map(function () {
        return possible.charAt(Math.floor(Math.random() * possible.length));
    }).join('');
};

/**
 * Create a fake Object ID for testing
 * @type {Function}
 */
exports.createFakeObjectId = function () {
    return createString(24);
};

//// See what Mongoose is up to
//mongoose.set('debug', function (coll, method, query, doc) {
//    console.log(coll + " " + method + " " + JSON.stringify(query) + " " + JSON.stringify(doc));
//});

/**
 * Check the number of invites the user currently has
 * @param inviteCount
 * @param user
 * @param done
 */
exports.checkInvites = function (inviteCount, user, done) {
    // Find the current user
    User.findOne({_id: user._id}, function (err, modifiedUser) {
        if (err) {
            should.not.exist(err);
            done();
        }
        // Check the number of invites the user has
        modifiedUser.invites.length.should.equal(inviteCount);
        // Examine the individual invite content
        switch (inviteCount) {
            case 2:
                modifiedUser.invites[1].invitedEmail.should.equal('newguy@test.com');
            case 1:
                modifiedUser.invites[0].invitedEmail.should.equal('test2@test.com');
                break;
            default:
                false.should.be.equal(true);
        }
        done();
    });
};

/**
 * Helper function for sending an invite during testing
 * @param server
 * @param inputUser
 * @param email
 * @returns {bluebird}
 */
exports.sendInvite = function (server, inputUser, email) {
    return new Promise(function (resolve, reject) {
        email = email || 'newguy@test.com';
        server
        .post('/inviteToTeam')
        .send({teamId: inputUser.teams[0], email: email})
        .expect(200)
        .end(function (err, res) {
            should.not.exist(err);
            res.status.should.equal(200);
            // Get the updated user record
            User.findOne({
                email: inputUser.email
            }, function (err, thisUser) {
                should.not.exist(err);
                resolve(thisUser);
            });
        });
    });
};