var helpers = require('./helpers');

module.exports.loginUser = function () {
    var emailInput, passwordInput, submitButton;
    // Go to the login page
    browser.get('/#!/auth/login');
    // Verify login page
    helpers.testUrl('auth/login');
    // Make sure login inputs exist
    emailInput = element(by.model('user.email'));
    expect(emailInput).toBeTruthy();
    passwordInput = element(by.model('user.password'));
    expect(passwordInput).toBeTruthy();
    submitButton = element(by.css('.submit_button'));
    expect(submitButton).toBeTruthy();
    // Clear inputs
    emailInput.clear();
    passwordInput.clear();
    emailInput.sendKeys('test@test.com');
    passwordInput.sendKeys('password');
    submitButton.click();
};