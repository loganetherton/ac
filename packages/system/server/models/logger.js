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
        required: true,
        trim: true
    },
    message: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
        trim: true
    },
    stackTrace: {
        type: String,
        required: true,
        trim: true
    },
    cause: {
        type: String,
        required: true,
        trim: true
    },
    user: {
        type: Schema.ObjectId,
        ref: 'User'
    }
});

/**
 * Statics
 */
//TaskSchema.statics.load = function (id, cb) {
//    this.findOne({
//        _id: id
//    }).populate('user', 'name username').exec(cb);
//};

mongoose.model('Logger', LoggerSchema);
