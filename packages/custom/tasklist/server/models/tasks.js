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

/**
 * Update modified time on save
 */
TaskSchema.pre('save', function (next) {
    this.modified = new Date();
    next();
});

mongoose.model('Task', TaskSchema);
