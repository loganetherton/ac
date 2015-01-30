var backend = null,
    helpers = new global.Helpers();

describe('Create task', function () {

    /**
     * Create a new task
     *
     * @param taskNumber
     */
    var createTask = function (taskNumber) {
        if (typeof taskNumber !== 'number') {
            expect(true).toBeFalsy();
        }
        browser.get('/#!/insert-task');
        //browser.getCurrentUrl().then(function (url) {
        //    if (!url.match(/insert-task/)) {
        //        browser.get('/#!/insert-task');
        //    }
        //});
        var titleVal = '';
        // Input title
        var title = element(by.model('taskInsertCtrl.task.title'));
        expect(title).toBeTruthy();
        title.sendKeys('fake ass title ' + taskNumber);
        // Get title and evaluate
        title.getAttribute('value').then(function (value) {
            expect(value).toBe('fake ass title ' + taskNumber);
        });
        //expect(title.getAttribute('value')).toBe('fake ass title ' + taskNumber);
        var content = $('div[contenteditable]');
        expect(content).toBeTruthy();
        content.sendKeys('fake ass content ' + taskNumber);
        content.getInnerHtml().then(function (html) {
            var regex = new RegExp(html);
            expect(html).toMatch(regex);
        });
        //expect(content.getAttribute('value')).toBe('fake ass content ' + taskNumber);
        element(by.buttonText('Submit')).click();
    };

    /**
     * Evaluate the newly created task
     * Note that all newly created tasks go to the top
     *
     * @param taskNumber
     */
    var evaluateTask = function (taskNumber) {
        browser.driver.manage().window().maximize();
        var repeater = element.all(by.repeater('task in taskListCtrl.tasks'));
        repeater.get(0).element(by.binding('task.title')).getText().then(function (text) {
            expect(text).toBe('fake ass title ' + taskNumber);
        });

        //repeater.get(0).element(by.binding('task.estimate')).getText().then(function (text) {
        //    expect(text).toBe('Bigdick von Monstercock');
        //});
        //
        //repeater.get(0).element(by.binding('task.dependencies_string')).getText().then(function (text) {
        //    expect(text).toBe('Bigdick von Monstercock');
        //});
    };

    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST('/register').passThrough();
        backend.whenPOST('/login').passThrough();
        backend.whenPOST('/newTask').respond(function(method, url, data, headers){
            return [200, data, {}];
        });
    });

    afterEach(function() {
        backend.clear();
    });

    it('should allow the user to login', function () {
        helpers.loginUser();
    });

    it('should allow the user to create a task', function () {
        createTask(0);
    });

    it('should have the new task in the tasklist menu', function () {
        evaluateTask(0);
    });

    it('should allow display another task after the first', function () {
        createTask(1);
    });

    it('should have the second task in the tasklist menu', function () {
        evaluateTask(1);
    });

    it('should allow the user to logout', function () {
        browser.get('/logout');
        helpers.testUrl('login');
    });
});