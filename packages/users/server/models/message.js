'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    sanitizer = require('sanitizer');

/**
 * Message schema
 * @type {Schema}
 */
var MessageSchema = new Schema({
    // Sending user
    user: {
        type: Schema.ObjectId,
        ref: 'User',
        required: true
    },
    // Message content
    content: {
        type: String,
        require: true,
        minLength: 1,
        maxLength: 1024
    },
    // Created date
    created: {
        type: Date
    },
    // Modified date
    modified: {
        type: Date
    }
});

/**
 * Set created date on initial save, modified date on all updates
 */
MessageSchema.pre('save', function (next) {
    // Set created on new message
    if (this.isNew) {
        this.created = new Date();
    }
    // Set modified on updated message
    this.modified = new Date();
    // @todo Run through sanitizer for message content
    next();
});

/**
 * Sanitize content
 */
MessageSchema.pre('save', function (next) {
    this.content = sanitizer.sanitize(this.content);
    next();
});

var Message = mongoose.model('Message', MessageSchema);

// Ensure messages aren't blank (minlength doesn't seem to be working)
Message.schema.path('content').validate(function (value) {
    return value.length;
}, 'Messages cannot be blank');

// Ensure messages aren't too long
Message.schema.path('content').validate(function (value) {
    return value.length < 1025;
}, 'Messages must less than or equal to 1025 characters');