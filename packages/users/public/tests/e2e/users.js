'use strict';

describe('registration page', function () {
    afterEach(function() {
        browser.manage().logs().get('browser').then(function(browserLog) {
            //expect(browserLog.length).toEqual(0);
            if (browserLog.length) {
                console.log('log: ' + require('util').inspect(browserLog));
            }
        });
    });

    describe('registration page elements', function () {
        it('should have a full name field', function () {

        });

        it('should have an email field', function () {

        });

        it('should have a password field', function () {

        });

        it('should have a password confirm field', function () {

        });

        it('should prevent the user from signing up if the passwords do not match', function () {

        });
    });
});