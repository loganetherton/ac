/**
 * Test the current URL
 * @param testUrl
 */
module.exports.testUrl = function (testUrl) {
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