'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

/**
 * Logger schema
 */
var LoggerSchema = new Schema({
    created: {
        type: Date,
        default: Date.now
    },
    url: {
        type: String,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    stackTrace: {
        type: String,
        trim: true
    },
    cause: {
        type: String,
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
}, {
    capped: 1024
});

/**
 * Statics
 */
//TaskSchema.statics.load = function (id, cb) {
//    this.findOne({
//        _id: id
//    }).populate('user', 'name username').exec(cb);
//};

mongoose.model('Log', LoggerSchema);
