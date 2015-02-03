'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
    Schema = mongoose.Schema,
    crypto = require('crypto'),
    _ = require('lodash'),
    uuid = require('node-uuid');

/**
 * Ensure that a password is given for local strategy only
 */
var validatePresenceOf = function (value) {
    // If you are authenticating by any of the oauth strategies, don't validate.
    return (this.provider && this.provider !== 'local') || (value && value.length);
};

/**
 * Ensure that the email given is unique
 * @param value
 * @param callback
 */
var validateUniqueEmail = function (value, callback) {
    var User = mongoose.model('User');
    User.find({
        $and: [
            {
                email: value
            },
            {
                _id: {
                    $ne: this._id
                }
            }
        ]
    }, function (err, user) {
        callback(err || user.length === 0);
    });
};

/**
 * Invitation schema
 * @type {Schema}
 */
var InviteSchema = new Schema({
    invitedEmail: {
        type: String, required: true
    },
    inviteString: {
        type: String
    },
    teamId: {
        type: Schema.ObjectId,
        ref: 'Team',
        required: true
    },
    expires: {
        type: Date
    }
});

/**
 * User Schema
 */
var UserSchema = new Schema({
    name: {
        type: String, required: true
    },
    email: {
        type: String,
        required: true,
        unique: true, set: function (email) {
            return email.toLowerCase();
        },
        match: [/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
                'Please enter a valid email'],
        validate: [validateUniqueEmail, 'E-mail address is already in-use']
    },
    roles: {
        type: Array, default: ['authenticated']
    },
    teams: [{type: Schema.Types.ObjectId, ref: 'Team'}],
    hashed_password: {
        type: String, validate: [validatePresenceOf, 'Password cannot be blank']
    },
    provider: {
        type: String, default: 'local'
    },
    // Invitations sent by this user
    invites: [InviteSchema],
    salt: String,
    resetPasswordToken: String,
    resetPasswordExpires: Date,
    facebook: {},
    twitter: {},
    github: {},
    google: {},
    linkedin: {}
});

UserSchema.path('teams').validate(function (teams) {
    return (teams && _.isArray(teams) && teams.length);
});

/**
 * Virtuals
 */
UserSchema.virtual('password').set(function (password) {
    this._password = password;
    this.salt = this.makeSalt();
    this.hashed_password = this.hashPassword(password);
}).get(function () {
    return this._password;
});

/**
 * Create a random invite string
 *
 * @param length
 * @returns {*|Socket|string}
 */
var createString = function (length) {
    var possible = 'abcdef0123456789';
    return Array.apply(null, new Array(length)).map(function () {
        return possible.charAt(Math.floor(Math.random() * possible.length));
    }).join('');
};

/**
 * Invitation pre-save
 */
InviteSchema.pre('save', function (next) {
    // Invite expires 7 days from now
    var date = new Date();
    date.setDate(date.getDate() + 7);
    this.expires = date;
    // Create an invite string
    this.inviteString = uuid.v4();
    next();
});

/**
 * Pre-save hook
 */
UserSchema.pre('save', function (next) {
    if (this.isNew && this.provider === 'local' && this.password && !this.password.length) {
        return next(new Error('Invalid password'));
    }
    next();
});

/**
 * Statics
 */
// Find user by email
UserSchema.statics.findByEmail = function (email, cb) {
    this.findOne({
        email: email
    }).exec(cb);
};

/**
 * Find a user by an invite code
 * @param regCode
 * @param cb
 */
UserSchema.statics.findByInviteCode = function (regCode, cb) {
    this.findOne()
    .where('invites')
    .elemMatch({inviteString : regCode})
    .exec(cb);
};

/**
 * Methods
 */
UserSchema.methods = {
    /**
     * HasRole - check if the user has required role
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    hasRole: function (role) {
        var roles = this.roles;
        return roles.indexOf('admin') !== -1 || roles.indexOf(role) !== -1;
    },

    /**
     * IsAdmin - check if the user is an administrator
     *
     * @return {Boolean}
     * @api public
     */
    isAdmin: function () {
        return this.roles.indexOf('admin') !== -1;
    },

    /**
     * Authenticate - check if the passwords are the same
     *
     * @param {String} plainText
     * @return {Boolean}
     * @api public
     */
    authenticate: function (plainText) {
        return this.hashPassword(plainText) === this.hashed_password;
    },

    /**
     * Make salt
     *
     * @return {String}
     * @api public
     */
    makeSalt: function () {
        return crypto.randomBytes(16).toString('base64');
    },

    /**
     * Hash password
     *
     * @param {String} password
     * @return {String}
     * @api public
     */
    hashPassword: function (password) {
        if (!password || !this.salt) {
            return '';
        }
        var salt = new Buffer(this.salt, 'base64');
        return crypto.pbkdf2Sync(password, salt, 10000, 64).toString('base64');
    }
};

mongoose.model('User', UserSchema);
