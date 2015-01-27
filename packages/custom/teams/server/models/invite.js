'use strict';

var mongoose = require('mongoose'),
Schema = mongoose.Schema,
userTaskHelper = require('../../../../../test/mochaHelpers/initUserAndTasks');

var InviteSchema = new Schema({
    inviter: {
        type: Schema.Types.ObjectId, ref: 'User', required: true
    },
    invitedEmail: {
        type: String, required: true
    },
    inviteString: {
        type: String
    },
    expires: {
        type: Date
    }
});

InviteSchema.pre('save', function (next) {
    // Invite expires 7 days from now
    var date = new Date();
    date.setDate(date.getDate() + 7);
    this.expires = date;
    // Create an invite string
    this.inviteString = userTaskHelper.createInviteString();
    next();
});

// Query invite by id
InviteSchema.statics.getById = function (id, cb) {
    this.findOne({
        _id: id
    }).exec(cb);
};

mongoose.model('Invite', InviteSchema);