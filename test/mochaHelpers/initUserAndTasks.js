var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Task = mongoose.model('Task'),
    q = require('q');

var user, task;

/**
 * Clear the tasks collection
 *
 * @returns {Promise.promise|*}
 */
var removeTasks = function () {
    var deferred = q.defer();
    Task.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear tasks collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

/**
 * Clear the users collection
 *
 * @returns {Promise.promise|*}
 */
var removeUsers = function () {
    var deferred = q.defer();
    User.remove({}, function (err) {
        if (err) {
            deferred.reject('Could not clear users collection');
        }
    });
    deferred.resolve('tasks cleared');
    return deferred.promise;
};

/**
 * Create another user
 */
exports.createOtherUser = function (done) {
    // Create a user
    user = new User({
        name: 'Full name',
        email: 'test2@test.com',
        password: 'password',
        teams: [mongoose.Types.ObjectId()]
    });
    /**
     * Clear the collection
     */
    removeUsers().then(function () {
        user.save(function (err) {
            if (err) {
                throw new Error('Could not create other user');
            }
            done();
        });
    });
    return user;
};

/**
 * Ensures that only a single user and task exist in the database
 *
 * @param done
 */
exports.createUserAndTask = function (done) {
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
        removeUsers().then(function () {
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
     * Clear the tasks collection and create a test task
     *
     * @returns {Promise.promise|*}
     */
    var initTasks = function () {
        var deferred = q.defer();
        task = new Task({
            title: 'Task Title',
            content: 'Task Content',
            user: user,
            team: user.teams[0]
        });
        removeTasks().then(function () {
            task.save(function (err) {
                if (err) {
                    deferred.reject('Failed to save task');
                }
                deferred.resolve('Saved task');
            });
        });
        return deferred.promise;
    };

    /**
     * Create user and task
     */
    q.all([initUsers(), initTasks()]).then(function () {
        done();
    }).fail(function (err) {
        console.log(err);
        should.not.exist(err);
    });

    return {
        user: user,
        task: task
    }
};

/**
 * Cleanup the user and task
 * @param done
 */
exports.removeUserAndTask = function (done, user, task) {
    q.all(user.remove(), task.remove()).then(function () {
        done();
    });
};