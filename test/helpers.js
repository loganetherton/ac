var _ = require('lodash');

var Helpers = function () {
    /**
     * Set input values
     *
     * @param model Angular model name
     * @param value Value to be set
     */
    var setInput = function (model, value) {
        var input = element(by.model(model));
        expect(input).toBeTruthy();
        input.clear();
        input.sendKeys(value);
        expect(input.getAttribute('value')).toBe(value);
    };
    return {
        /**
         * Determine whether the user is already registered before loggin in
         *
         * @param email Login email
         * @returns promise
         */
        searchRegisteredUsers: function (email) {
            var deferred = protractor.promise.defer();
            // if the user doesn't exist, create the user
            if (!_.find(global.registeredUsers, function (users) {
                return users === email;
            })) {
                var helpers = new Helpers();
                return helpers.createUser(email).then(function () {
                    deferred.fulfill('registered');
                    return deferred.promise;
                });
            } else {
                deferred.fulfill();
                return deferred.promise;
            }
        },
        /**
         * Test the current URL
         * @param testUrl
         */
        testUrl: function (testUrl) {
            // Generic wait function
            browser.wait(function () {
                var deferred = protractor.promise.defer();
                browser.getCurrentUrl().then(function (url) {
                    expect(url).toEqual('http://localhost:3000/#!/' + testUrl);
                    deferred.fulfill(true);
                });
                return deferred.promise;
            });
        },
        /**
         * Login with a user that has already been created, or else create one and login
         */
        loginUser: function (email, password) {
            var submitButton,
                self = this;
            // Set default values, if none are passed in
            if (typeof email !== 'string' || typeof password !== 'string' || !email.match(/.*?@.*\..*/) || !/\S/.test(password)) {
                email = 'test@test.com';
                password = 'password';
            }
            self.searchRegisteredUsers(email).then(function (data) {
                // If the user was registered, don't need to login
                if (data === 'registered') {
                    return;
                }
                // Go to the login page
                browser.get('/#!/auth/login');
                // Verify login page
                self.testUrl('auth/login');
                // Find submit button
                submitButton = element(by.css('.submit_button'));
                expect(submitButton).toBeTruthy();
                // Input email and password
                setInput('user.email', email);
                setInput('user.password', password);
                submitButton.click();
            });
        },
        /**
         * Create a user
         */
        createUser: function (email, password, name) {
            var submitButton,
                self = this;
            var deferred = protractor.promise.defer();
            // Set default input values, if not set
            if (typeof name !== 'string' || !/\S/.test(name)) {
                name = 'Bigdick von Monstercock'
            }
            if (typeof email !== 'string' || !email.match(/.*?@.*\..*/)) {
                email = 'test@test.com';
            }
            if (typeof password !== 'string' || !/\S/.test(password)) {
                password = 'password';
            }
            // Go to register page
            browser.get('/#!/auth/register');
            // Name
            setInput('user.name', name);
            // Email
            setInput('user.email', email);
            // password
            setInput('user.password', password);
            // Confirm password
            setInput('user.confirmPassword', password);
            // Submit
            submitButton = element(by.css('.submit_button'));
            submitButton.click().then(function () {
                self.testUrl('tasklist');
            });
            global.registeredUsers.push(email);
            deferred.fulfill();
            return deferred.promise;
        }
    };
};

module.exports.Helpers = Helpers;
