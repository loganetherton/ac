var backend = null,
    helpers = new global.Helpers();

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
        it('should be hidden when logged out', function () {
            browser.get('/logout');
            browser.get('/#!/login');
            expect($('#nav-container').isDisplayed()).toBeFalsy();
        });
    });

    describe('logged in', function () {
        it('should allow us to login', function () {
            helpers.loginUser();
        });

        it('should have five menu items', function () {
            var elementCount = 0;
            navigationMenuItems = element.all(by.css('#nav li'));
            // Make sure the right number are displayed
            navigationMenuItems.each(function (element) {
                element.isDisplayed().then(function () {
                    elementCount++;
                });
            }).then(function () {
                expect(elementCount).toBe(6);
            });
        });

        it('should have project overview as a menu item', function () {
            navigationMenuItems.get(0).getText().then(function (text) {
                expect(text).toBe('Project overview');
            });
        });

        it('should have tasklist as a menu item', function () {
            navigationMenuItems.get(1).getText().then(function (text) {
                expect(text).toMatch(/Tasklist/);
            });
        });

        it('should have team messages as a menu item', function () {
            navigationMenuItems.get(2).getText().then(function (text) {
                expect(text).toBe('Insert task');
            });
        });

        it('should have team as a menu item', function () {
            navigationMenuItems.get(3).getText().then(function (text) {
                expect(text).toBe('Team');
            });
        });

        it('should have create tasks as a menu item', function () {
            navigationMenuItems.get(4).getText().then(function (text) {
                expect(text).toBe('Timeline');
            });
        });

        it('should have create tasks as a menu item', function () {
            navigationMenuItems.get(5).getText().then(function (text) {
                expect(text).toBe('Create tasks');
            });
        });

        it('should allow the user to logout', function () {
            browser.get('/logout');
            helpers.testUrl('login');
        });
    });
});