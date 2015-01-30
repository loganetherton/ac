'use strict';

var submitButton,
    backend = null,
    helpers = new global.Helpers();

/**
 * Make sure the user can't submit the page without good values
 */
var testBadSubmit = function (loginPage) {
    if (typeof submitButton === 'undefined' || !submitButton) {
        submitButton = element(by.css('.submit_button'));
        expect(submitButton).toBeTruthy();
    }
    submitButton.click();
    if (loginPage) {
        helpers.testUrl('login');
    } else {
        helpers.testUrl('register');
    }
};

describe('registration page', function () {
    var nameInput, emailInput, passwordInput;

    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST(/.*/).passThrough();
    });

    afterEach(function() {
        backend.clear();
    });

    it('should find all of the registration elements', function () {
        //browser.ignoreSynchronization = true;
        browser.get('/#!/register');
        // Name
        nameInput = element(by.model('user.name'));
        expect(nameInput).toBeTruthy();
        // Email
        emailInput = element(by.model('user.email'));
        expect(emailInput).toBeTruthy();
        // password
        passwordInput = element(by.model('user.password'));
        expect(passwordInput).toBeTruthy();
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

    it('should allow the user to sign up with correct values', function () {
        helpers.loginUser();
    });

    it('should allow the user to logout', function () {
        browser.get('/logout');
        helpers.testUrl('login');
    });
});

describe('login page', function () {
    var emailInput, passwordInput;

    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST(/.*/).passThrough();
    });

    afterEach(function() {
        backend.clear();
    });

    it('should find all of the login page elements', function () {
        // Need to find this page's submit button
        submitButton = null;
        browser.get('/#!/login');
        // Email
        emailInput = element(by.model('user.email'));
        expect(emailInput).toBeTruthy();
        // password
        passwordInput = element(by.model('user.password'));
        expect(passwordInput).toBeTruthy();
    });

    it('should have an email field and let the user type', function () {
        emailInput.sendKeys('test@test.com');
        expect(emailInput.getAttribute('value')).toBe('test@test.com');
        testBadSubmit(true);
        emailInput.clear();
    });

    it('should have a password field and let the user type', function () {
        passwordInput.sendKeys('password');
        expect(passwordInput.getAttribute('value')).toBe('password');
        testBadSubmit(true);
    });

    it('should allow the user to login with the previously created user', function () {
        helpers.loginUser();
        helpers.testUrl('tasklist');
    });
});