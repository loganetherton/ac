var backend = null;

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
        // Input title
        var title = element(by.model('tasklistInsert.title'));
        expect(title).toBeTruthy();
        title.sendKeys('fake ass title ' + taskNumber);
        expect(title.getAttribute('value')).toBe('fake ass title ' + taskNumber);
        var content = element(by.model('tasklistInsert.content'));
        expect(content).toBeTruthy();
        content.sendKeys('fake ass content ' + taskNumber);
        expect(content.getAttribute('value')).toBe('fake ass content ' + taskNumber);
        element(by.buttonText('Submit')).click();
    };

    /**
     * Evaluate the newly created task
     * Note that all newly created tasks go to the top
     *
     * @param taskNumber
     */
    var evaluateTask = function (taskNumber) {
        element(by.repeater('task in tasklist.tasks').row(0).column('task.title')).getText().then(function (text) {
            expect(text).toBe('fake ass title ' + taskNumber);
        });

        element(by.repeater('task in tasklist.tasks').row(0).column('task.content')).getText().then(function (text) {
            expect(text).toBe('fake ass content ' + taskNumber);
        });
    };

    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST('/register').passThrough();
        backend.whenPOST('/newTask').respond(function(method, url, data, headers){
            return [200, data, {}];
        });
    });

    afterEach(function() {
        backend.clear();
    });

    it('should allow the user to login', function () {
        global.login.loginUser();
        // Need to reload for socket in protractor for some reason...
        browser.get('#!/tasklist');
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
});