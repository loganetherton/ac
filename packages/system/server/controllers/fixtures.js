'use strict';

var mean = require('meanio'),
mongoose = require('mongoose'),
User = mongoose.model('User');

exports.clearUsers = function (req, res, next) {
    User.remove({}, function(err) {
        if (err) {
            console.log(err);
            return res.status(400);
        } else {
            console.log('User collection cleared');
            return res.status(200);
        }
    });
};