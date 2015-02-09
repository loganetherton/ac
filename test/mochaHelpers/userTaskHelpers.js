var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    Team = mongoose.model('Team'),
    q = require('q'),
    Promise = require('bluebird');

var user, secondUser, task, team;

var loginUser = require('../mochaHelpers/loginUser');

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
            resolve('Tasks collection cleared');
        });
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
 * @returns {bluebird}
 */
var removeTeams = function () {
    return new Promise(function (resolve, reject) {
        Team.remove({}, function (err) {
            if (err) {
                reject('Could not clear teams collection');
            }
        });
        resolve('teams cleared');
    });
};

/**
 * Create another user
 *
 * Poor planning, ugh
 */
var createOtherUser = exports.createOtherUser = function (email) {
    return new Promise(function (resolve, reject) {
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
                resolve(user);
            });
        });
    });
};

/**
 * Create a task
 * @type {Function}
 */
var createTask = exports.createTask = function (taskCount, thisUser) {
    return new Promise(function (resolve, reject) {
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
                    reject('Failed to save task');
                }
                resolve('Saved task');
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
    });
};

/**
 * Clear the users collection and create a test user
 *
 * @returns {Promise.promise|*}
 */
var initUsers = function (email) {
    email = email || 'test@test.com';
    return new Promise(function (resolve, reject) {
        // Create user
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
                reject('Could not save team');
            }
            // Add user to team
            user.teams.push(team._id);
            // Save the user
            user.save(function (err) {
                if (err) {
                    reject('Could not save user');
                }
                resolve(user);
            });
        });
    });
};

/**
 * Ensures that only a single user and task exist in the database
 */
var createUserAndTask = exports.createUserAndTask = function () {
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
            }, function (err) {
                console.log(err);
                should.not.exist(err);
            });
        });
    });
};

/**
 * Ensures that only a single user and task exist in the database
 */
exports.createUserAndTeam = function (clear, email) {
    clear = typeof clear !== 'undefined' ? clear : true;
    email = email || 'test@test.com';
    return new Promise(function (resolve, reject) {
        removeUsersAndTeams(clear).then(function () {
            /**
             * Create user and task
             */
            initUsers(email)
            .then(function (user) {
                resolve({
                    user: user,
                    team: team
                });
            })
            .catch(function (err) {
                console.log(err);
                should.not.exist(err);
            });
        });
    });
};

/**
 * Remove all users and tasks from DB
 */
var removeUsersAndTasks = exports.removeUsersAndTasks = function () {
    return Promise.all([removeUsers(), removeTasks()])
};

/**
 * Cleanup the user and task
 * @param done
 */
var removeUsersAndTeams = exports.removeUsersAndTeams = function (clear) {
    return new Promise(function (resolve, reject) {
        if (!clear) {
            return resolve();
        }
        return q.all(removeUsers(), removeTeams()).then(function () {
            resolve();
        });
    });
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
var sendInvite = exports.sendInvite = function (server, inputUser, email) {
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

/**
 * Clear the users collection
 * @returns {bluebird}
 */
exports.clearUsers = function () {
    return new Promise(function (resolve, reject) {
        User.remove({}, function (err) {
            if (err) {
                reject('Could not clear users collection');
            }
        });
        resolve('tasks cleared');
    });
};

/**
 * Clear the teams collection
 * @returns {bluebird}
 */
exports.clearTeams = function () {
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
exports.createUserAndSendInvite = function (thisServer) {
    var server = thisServer;
    return {
        /**
         * Create first user and log this user in
         * @returns {*|webdriver.promise.Promise}
         */
        firstUser: function () {
            // Create the first user
            return createUserAndTask().then(function (userTask) {
                // Log the first user in
                user = userTask['user'];
                return loginUser(server, user.email, user.password);
            });
        },
        /**
         * Send the invite
         * @param invitingUser
         * @param invitedEmail
         * @returns {*}
         */
        sendInvite: function (invitingUser, invitedEmail) {
            return sendInvite(server, invitingUser, invitedEmail)
        },
        /**
         * Log the user out
         * @param thisUser
         * @returns {bluebird}
         */
        logout: function (thisUser) {
            return new Promise(function (resolve, reject) {
                server
                .get('/logout')
                .expect(302)
                .end(function (err, res) {
                    if (err) {
                        reject(err);
                    }
                    resolve(thisUser);
                });
            });
        },
        // Create a second user, send an invite, logout
        otherUser: function (email) {
            email = email || 'test2@test.com';
            // Create a second user
            return createOtherUser(null, email, true)
                // Log the second user in
            .then(function (thisUser) {
                secondUser = thisUser;
                return loginUser(server, secondUser.email, secondUser.password);
            });
        }
    };
};