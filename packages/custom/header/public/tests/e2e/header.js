var backend = null,
helpers = new global.Helpers();

describe('Get user information in user dropdown', function () {
    var userDropdown;
    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST(/.*/).passThrough();
        // Get the dropdown
        userDropdown = $('user-dropdown ul li a');
    });

    afterEach(function() {
        backend.clear();
    });

    it('should allow the user to login', function () {
        helpers.loginUser();
    });

    it('should allow the dropdown to appear on click', function () {
        // Profile link and log out should be hidden
        var profileLink = $('.dropdown_profile');
        var logoutLink = $('.dropdown_logout');
        // Make sure the links aren't visible
        expect(profileLink.isDisplayed()).toBeFalsy();
        expect(logoutLink.isDisplayed()).toBeFalsy();
        // Expand the dropdown
        userDropdown.click();
        expect(profileLink.isDisplayed()).toBeTruthy();
        expect(logoutLink.isDisplayed()).toBeTruthy();
    });

    it('should have two menu items in the user dropdown', function () {
        var dropDownItems = element.all(by.css('user-dropdown ul li ul a'));
        expect(dropDownItems.count()).toBe(2);
    });

    it('should show the users name', function () {
        expect($('user-dropdown span span').getText()).toBe('Bigdick von Monstercock');
    });

    //it('should show the users profile image', function () {
    //
    //});
});