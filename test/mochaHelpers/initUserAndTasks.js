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
    user.save(function (err) {
        if (err) {
            throw new Error('Could not create other user');
        }
        done();
    });
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
 * Ensures that only a single user and task exist in the database
 *
 * @param done
 */
exports.createUserAndTask = function (done) {
    var deferred = q.defer();
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
        user.save(function (err) {
            if (err) {
                deferred.reject('Could not save user');
            }
            deferred.resolve('Saved user');
        });
        return deferred.promise;
    };

    removeUsersAndTasks().then(function () {
        /**
         * Create user and task
         */
        q.all([initUsers(), createTask()]).then(function () {
            done();
            deferred.resolve({
                user: user,
                task: task
            });
        }).fail(function (err) {
            console.log(err);
            should.not.exist(err);
        });
    });
    return deferred.promise;
};

/**
 * Cleanup the user and task
 * @param done
 */
var removeUsersAndTasks = exports.removeUsersAndTasks = function (done) {
    var deferred = q.defer();
    q.all(removeUsers(), removeTasks()).then(function () {
        deferred.resolve();
        if (typeof done !== 'undefined') {
            done();
        }
    });
    return deferred.promise;
};