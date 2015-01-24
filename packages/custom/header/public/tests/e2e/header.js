describe('Get user information in user dropdown', function () {
    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
    });

    afterEach(function() {
        backend.clear();
    });

    it('should allow the user to login', function () {
        helpers.loginUser();
    });
});