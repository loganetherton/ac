'use strict';

/**
 * Test the current URL
 * @param testUrl
 */
var testUrl = function (testUrl) {
    // Generic wait function
    browser.wait(function () {
        var deferred = protractor.promise.defer();
        browser.getCurrentUrl().then(function (url) {
            expect(url).toEqual('http://localhost:3000/#!/' + testUrl);
            deferred.fulfill(true);
        });
        return deferred.promise;
    });
};

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
        var nameInput, emailInput, passwordInput, confirmInput, submitButton;

        /**
         * Make sure the user can't submit the page without good values
         */
        var testBadSubmit = function () {
            if (typeof submitButton === 'undefined') {
                submitButton = element(by.css('.submit_button'));
                expect(submitButton).toBeTruthy();
            }
            submitButton.click();
            testUrl('auth/register');
        };

        it('should find all of the registration elements', function () {
            browser.get('/#!/auth/register');
            // Name
            nameInput = element(by.model('user.name'));
            expect(nameInput).toBeTruthy();
            // Email
            emailInput = element(by.model('user.email'));
            expect(emailInput).toBeTruthy();
            // password
            passwordInput = element(by.model('user.password'));
            expect(passwordInput).toBeTruthy();
            // Confirm password
            confirmInput = element(by.model('user.confirmPassword'));
            expect(confirmInput).toBeTruthy();
        });

        it('should have a full name field and let the user type', function () {
            nameInput.sendKeys('Bigdick von Monstercock');
            expect(nameInput.getAttribute('value')).toBe('Bigdick von Monstercock');
            testBadSubmit();
        });

        it('should have an email field and let the user type', function () {
            emailInput.sendKeys('test@test.com');
            expect(emailInput.getAttribute('value')).toBe('test@test.com');
            testBadSubmit();
        });

        it('should have a password field and let the user type', function () {
            passwordInput.sendKeys('password');
            expect(passwordInput.getAttribute('value')).toBe('password');
            testBadSubmit();
        });

        it('should have a password confirm field', function () {
            confirmInput.sendKeys('badpassword');
            expect(confirmInput.getAttribute('value')).toBe('badpassword');
            testBadSubmit();
        });

        // Damnit, protractor doesn't support redirects right now. That's kinda fucked up
        // https://github.com/angular/protractor/issues/1376
        // Need to find another way to test
        it('should allow the user to sign up with correct values', function () {
            confirmInput.clear();
            confirmInput.sendKeys('password');
            expect(confirmInput.getAttribute('value')).toBe('password');
            submitButton.click();
            testUrl('tasklist');
        });
    });
});