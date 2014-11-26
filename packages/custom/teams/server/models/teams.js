'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var TeamSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    userCount: {
        type: Number,
        default: 0
    },
    modified: {
        type: Date
    }
});

// Update created and modified before save
TeamSchema.pre('save', function (next) {
    // Set modified always, created can be found in ObjectId of record
    this.modified = new Date();
    next();
});

// Query task by user ID
TeamSchema.statics.getById = function (id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

// Created datetime: http://stackoverflow.com/questions/13350642/how-to-get-creation-date-from-object-id-in-mongoose

mongoose.model('Team', TeamSchema);