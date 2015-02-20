/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    Promise = require('bluebird'),
    userTaskHelper = require('../../../../test/mochaHelpers/userTaskHelpers');

var user, messageRaw, message;

describe('Model: Message', function () {

    // Clear users and teams
    before(function (done) {
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
            done();
        });
    });

    // Create a user for testing
    before(function (done) {
        userTaskHelper.createUserAndTeam().then(function (userTeam) {
            user = userTeam['user'];
            done();
        });
    });

    // Clear users and teams
    after(function (done) {
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers()]).then(function () {
            done();
        });
    });

    it('should now allow an empty message to be saved', function (done) {
        messageRaw = {
            user: user._id,
            content: ''
        };
        // new message instance
        message = new Message(messageRaw);
        // Save it
        message.save(function (err) {
            should.exist(err);
            // Should not be permitted
            err.errors.content.message.should.be.equal('Messages cannot be blank');
            done();
        });
    });

    it('should not allow a message over 1024 characters to be saved', function (done) {
        // Too long string
        messageRaw.content = userTaskHelper.createString(1025);
        message = new Message(messageRaw);
        // Check for errors on save
        message.save(function (err) {
            should.exist(err);
            // Should not be permitted
            err.errors.content.message.should.be.equal('Messages must less than or equal to 1025 characters');
            done();
        });
    });

    it('should placed the created and modified time on insert', function (done) {
        done();
    });

    it('should update the modified time on update', function (done) {
        done();
    });

    it('should sanitize unsafe input', function (done) {
        // sanitizer
        done();
    });
});