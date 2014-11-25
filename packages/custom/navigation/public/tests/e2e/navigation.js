var backend = null;

describe('navigation menu', function () {
    var navigationMenuItems;
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

    describe('logged out', function () {
        it('should have two menu items shown', function () {
            browser.get('/#!/auth/login');
            var elementCount = 0;
            navigationMenuItems = element.all(by.css('ul[data-smart-menu] li'));
            // Make sure the right number are displayed
            navigationMenuItems.each(function (element) {
                element.isDisplayed().then(function () {
                    elementCount++;
                });
            }).then(function () {
                expect(elementCount).toBe(2);
            });
        });
        it('should have register account as a menu item', function () {
            navigationMenuItems.get(0).getText().then(function (text) {
                expect(text).toBe('Register');
            });
        });

        it('should have login as a menu item', function () {
            navigationMenuItems.get(1).getText().then(function (text) {
                expect(text).toBe('Login');
            });
        });
    });

    describe('logged in', function () {
        it('should allow us to login', function () {
            global.login.loginUser();
        });

        it('should have five menu items', function () {
            var elementCount = 0;
            navigationMenuItems = element.all(by.css('ul[data-smart-menu] li'));
            // Make sure the right number are displayed
            navigationMenuItems.each(function (element) {
                element.isDisplayed().then(function () {
                    elementCount++;
                });
            }).then(function () {
                expect(elementCount).toBe(4);
            });
        });

        it('should have tasklist as a menu item', function () {
            navigationMenuItems.get(0).getText().then(function (text) {
                expect(text).toBe('Tasklist');
            });
        });

        it('should have team as a menu item', function () {
            navigationMenuItems.get(1).getText().then(function (text) {
                expect(text).toBe('Team');
            });
        });

        it('should have team messages as a menu item', function () {
            navigationMenuItems.get(2).getText().then(function (text) {
                expect(text).toBe('Team Messages');
            });
        });

        it('should have logout as a menu item', function () {
            navigationMenuItems.get(3).getText().then(function (text) {
                expect(text).toBe('Logout');
            });
        });
    });
});