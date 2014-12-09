var backend = null,
    helpers = new global.Helpers(),
    tasks;

var _ = require('lodash');

/**
 * Verify that the tasks present are the ones expected
 * @param start
 * @param prevNext
 */
var examineTasks = function (start, prevNext, taskCount) {
    // Just handle next page with defaults if that's the only argument
    if (arguments.length === 1) {
        prevNext = arguments[0];
    }
    // Default start to 0
    if (_.isUndefined(start) || !_.isNumber(start)) {
        start = 0;
    }
    // Default taskCount to 5
    if (_.isUndefined(taskCount)) {
        taskCount = 5;
    }
    // Click previous or next page
    if (_.isString(prevNext)) {
        if (prevNext !== 'prev' && prevNext !== 'next') {
            throw new Error('Pass in prev or next to change pages of tasks');
        }
        element(by.css('.' + prevNext + 'Page')).click();
    }
    expect(element(by.repeater('task in recentProjectsCtrl.tasks').row(0)).getText()).toEqual('Fake title ' + start);
    expect(element(by.repeater('task in recentProjectsCtrl.tasks').row(_.parseInt(taskCount - 1))).getText()).toEqual('Fake title ' + parseInt(start + taskCount - 1));
};

/**
 * Open the recent-tasks directive and examine tasks present
 */
var openAndExamine = function () {
    var recentTasks = element(by.css('recent-tasks'));
    // Open the recent tasks directive
    recentTasks.click();
    examineTasks();
};

describe('Recent tasks', function () {
    beforeEach(function () {
        backend = new global.HttpBackend(browser);
    });

    beforeEach(function () {
        backend.whenGET('/recentTasks/1').respond(function(method, url, data, headers){
            // I don't understand why I can't access helpers from within here...
            return [200, [ { title: 'Fake title 0', content: 'Fake content 0' },
                           { title: 'Fake title 1', content: 'Fake content 1' },
                           { title: 'Fake title 2', content: 'Fake content 2' },
                           { title: 'Fake title 3', content: 'Fake content 3' },
                           { title: 'Fake title 4', content: 'Fake content 4' } ], {}];
        });
        backend.whenGET('/recentTasks/2').respond(function(method, url, data, headers){
            return [200, [ { title: 'Fake title 5', content: 'Fake content 5' },
                           { title: 'Fake title 6', content: 'Fake content 6' },
                           { title: 'Fake title 7', content: 'Fake content 7' },
                           { title: 'Fake title 8', content: 'Fake content 8' },
                           { title: 'Fake title 9', content: 'Fake content 9' } ], {}];
        });
        backend.whenGET('/recentTasks/3').respond(function(method, url, data, headers) {
            return [200, [{title: 'Fake title 10', content: 'Fake content 10'},
                          {title: 'Fake title 11', content: 'Fake content 11'},
                          {title: 'Fake title 12', content: 'Fake content 12'}], {}];
        });
        backend.whenGET(/.*/).passThrough();
        backend.whenPOST(/.*/).passThrough();
    });

    afterEach(function() {
        backend.clear();
    });

    it('should allow the user to login', function () {
        helpers.loginUser();
    });

    it('should be able to open the recent-tasks directive dropdown', function () {
        browser.get('#!/tasklist');
        openAndExamine();
    });

    it('should not be able to go back past page one', function () {
        examineTasks('prev');
    });

    it('should be able to retrieve page 2', function () {
        examineTasks(5, 'next');
    });

    it('should be able to retrieve page 3', function () {
        examineTasks(10, 'next', 3);
    });

    it('should stay on page 3 if a non-existent page is requested', function () {
        examineTasks(10, 'next', 3);
    });

    it('should allow the user to logout', function () {
        helpers.logoutUser();
    });
});