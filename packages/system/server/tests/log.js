'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
    mongoose = require('mongoose'),
    User = mongoose.model('User'),
    Log = mongoose.model('Log');

/**
 * Globals
 */
var user;
var task;

/**
 * Logging
 */
describe('Model Log:', function() {

    beforeEach(function(done) {
        user = new User({
            name: 'Full name',
            email: 'test@test.com',
            username: 'user',
            password: 'password'
        });

        user.save(function() {
            task = new Log({
                url: 'http://localhost:3000/#!/tasklist',
                message: 'Log',
                type: 'debug',
                stackTrace: '{anonymous}()@http://localhost:3000/bower_components/angular/angular.js:80:12,assertArg@http://localhost:3000/bower_components/angular/angular.js:1610:11,assertArgFn@http://localhost:3000/bower_components/angular/angular.js:1620:3,{anonymous}()@http://localhost:3000/bower_components/angular/angular.js:8319:9,{anonymous}()@http://localhost:3000/bower_components/angular/angular.js:7496:34,forEach@http://localhost:3000/bower_components/angular/angular.js:343:20,nodeLinkFn@http://localhost:3000/bower_components/angular/angular.js:7483:11,compositeLinkFn@http://localhost:3000/bower_components/angular/angular.js:6991:13,publicLinkFn@http://localhost:3000/bower_components/angular/angular.js:6870:30,link@http://localhost:3000/bower_components/angular/angular.js:23354:38',
                cause: '<div class="navbar navbar-inverse navbar-fixed-top ng-scope" data-ng-include="\'/system/views/header.html\'" data-role="navigation">',
                user: user
            });

            done();
        });
    });

    describe.only('Method Save', function() {
        it('should be able to save without problems', function(done) {
            return task.save(function(err) {
                should.not.exist(err);
                task.url.should.equal('http://localhost:3000/#!/tasklist');
                task.message.should.equal('Log');
                task.type.should.equal('debug');
                task.stackTrace.should.match(/^\{anonymous\}/);
                task.cause.should.match(/^<div class/);
                task.user.should.not.have.length(0);
                done();
            });
        });

        it('should show an error when trying to save without type', function(done) {
            task.type = '';

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