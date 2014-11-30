'use strict';

var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var acMessage = new Schema({
    user: {
        type: Schema.ObjectId,
        red: 'User'
    },
    channel: {
        type: String,
        require: true
    },
    message: {
        type: String,
        required: true
    },
    time: {
        type: Date
    },
    expires: {
        type: Number
    }
});

mongoose.model('acMessage', acMessage);