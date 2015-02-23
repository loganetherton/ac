/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    Message = mongoose.model('Message'),
    Promise = require('bluebird'),
    userTaskHelper = require('../../../../test/mochaHelpers/userTaskHelpers');

var user, messageRaw, message, createdTime, modifiedTime;

describe('Model: Message', function () {
    // Clear users and teams
    before(function (done) {
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers(),
                     userTaskHelper.clearMessages()]).then(function () {
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
        Promise.all([userTaskHelper.clearTeams(), userTaskHelper.clearUsers(),
                     userTaskHelper.clearMessages()]).then(function () {
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
        // Valid content
        messageRaw.content = 'Test content';
        message = new Message(messageRaw);
        // No errors
        message.save(function (err) {
            should.not.exist(err);
            createdTime = message.created;
            modifiedTime = message.modified;
            // Check that created and modified were set
            message.created.should.be.lessThan(new Date());
            message.modified.should.be.lessThan(new Date());
            done();
        });
    });

    it('should update the modified time on update', function (done) {
        // Get the original timestamps
        var originalModifiedTime = message.modified.getTime();
        var originalCreatedTime = message.created.getTime();
        // Save again to make sure modified is updated
        message.save(function (err) {
            should.not.exist(err);
            // Retrieve updated record
            Message.findOne({}, function (err, thisMessage) {
                // Make sure modified time was updated
                originalModifiedTime.should.be.lessThan(thisMessage.modified.getTime());
                // ...and created time was not
                originalCreatedTime.should.be.equal(thisMessage.created.getTime());
                done();
            });
        });
    });

    it('should XSS sanitize unsafe input', function (done) {
        // Contrived XSS
        message.content = '<pre>Hi, guys!</pre><script>alert("XSS!");</script>';
        message.save(function (err) {
            should.not.exist(err);
            // Get updated record
            Message.findOne({}, function (err, thisMessage) {
                thisMessage.content.should.be.equal('<pre>Hi, guys!</pre>');
                done();
            });
        });
    });
});