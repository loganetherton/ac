'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
mongoose = require('mongoose'),
User = mongoose.model('User'),
Task = mongoose.model('Task');

/**
 * Globals
 */
var user;
var task;

/**
 * Test Suites
 */
describe('<Unit Test>', function() {
    describe('Model Task:', function() {
        beforeEach(function(done) {
            user = new User({
                name: 'Full name',
                email: 'test@test.com',
                username: 'user',
                password: 'password'
            });

            user.save(function() {
                task = new Task({
                    title: 'Task Title',
                    content: 'Task Content',
                    user: user
                });

                done();
            });
        });

        describe('Method Save', function() {
            it('should be able to save without problems', function(done) {
                return task.save(function(err) {
                    should.not.exist(err);
                    task.title.should.equal('Task Title');
                    task.content.should.equal('Task Content');
                    task.user.should.not.have.length(0);
                    task.created.should.not.have.length(0);
                    done();
                });
            });

            it('should be able to show an error when try to save without title', function(done) {
                task.title = '';

                return task.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without content', function(done) {
                task.content = '';

                return task.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

            it('should be able to show an error when try to save without user', function(done) {
                task.user = {};

                return task.save(function(err) {
                    should.exist(err);
                    done();
                });
            });

        });

        afterEach(function(done) {
            task.remove();
            user.remove();
            done();
        });
    });
});
