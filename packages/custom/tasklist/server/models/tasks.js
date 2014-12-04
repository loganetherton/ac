'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
Schema = mongoose.Schema;

/**
 * Task Schema
 */
var TaskSchema = new Schema({
    modified: {
        type: Date,
        default: Date.now
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    team: {
        type: Schema.ObjectId,
        ref: 'Team',
        required: true
    }
});

/**
 * Validations
 */
TaskSchema.path('title').validate(function (title) {
    return !!title;
}, 'Title cannot be blank');

TaskSchema.path('content').validate(function (content) {
    return !!content;
}, 'Content cannot be blank');

TaskSchema.path('user').validate(function (user) {

});

/**
 * Statics
 */
    // Query task by ID
TaskSchema.statics.load = function (id, cb) {
    this.findOne({
        _id: id
    }).populate('user', 'name').exec(cb);
};

// Query task by user ID
TaskSchema.statics.loadByUserId = function (id, cb) {
    this.find({
        user: id
    }).populate('user', 'name').exec(cb);
};

// Query tasks by team ID
TaskSchema.statics.loadByTeamId = function (id, cb) {
    this.find({
        team: id
    },
    null,
    {sort: {_id: -1}}).populate('user', 'name').exec(cb);
};

// Get most recent tasks for the requested user
TaskSchema.statics.getMostRecent = function (userId, count, page, callback) {
    // Set page to 1 if not set
    page = page || 1;
    var args = Array.prototype.slice.call(arguments);
    // For calls without page or count specified
    if (typeof args[args.length - 1] !== 'function') {
        for (var thisArg in args) {
            if (args.hasOwnProperty(thisArg) && typeof args[thisArg] === 'function') {
                callback = args[thisArg];
            }
        }
    } else {
        callback = args[args.length - 1];
    }
    // Pagination
    page = args.length < 4 ? 1 : page;
    page = (page - 1) * 5;
    // Default count
    count = args.length < 3 ? 5 : count;
    // Find the requested tasks
    this.find({
        user: userId
    }, null, {sort: {_id: -1}}).skip(page).limit(count).populate('user', 'name').exec(callback);
};

/**
 * Update modified time on save
 */
TaskSchema.pre('save', function (next) {
    this.modified = new Date();
    next();
});

mongoose.model('Task', TaskSchema);
