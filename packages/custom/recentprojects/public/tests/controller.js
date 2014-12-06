'use strict';
var tasks;

/**
 * Generate tasks for comparison
 * @param start
 * @param count
 */
var generateTasks = function (start, count) {
    for (var i = start; i<start+count; i++) {
        tasks.push({
            title: 'Fake title ' + i,
            content: 'Fake content ' + i
        });
    }
};

describe('RecentprojectsController', function () {
    var scope, controller, recentTasksService;

    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.recentprojects', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.factory('RecentTasksService', ProjectServiceMock);
        });
    });

    beforeEach(inject(function ($rootScope, $controller, RecentTasksService) {
        tasks = [];
        scope = $rootScope.$new();
        // Spy on the RecentTasksService
        recentTasksService = RecentTasksService;
        spyOn(recentTasksService, 'loadTasks').andCallThrough();
        controller = $controller('RecentprojectsController', {$scope: scope});
        scope.$digest();
    }));

    it('should have all methods', function () {
        expect(typeof controller.loadTasks).toEqual('function');
        var keys = Object.keys(controller);
        var i, total = 0;
        // Make sure we don't have any untested
        for (i=0; i<keys.length; i++) {
            if (_.isFunction(controller[keys[i]])) {
                total = total + 1;
            }
        }
        expect(total).toEqual(1);
    });

    it('should start on page one', function () {
        expect(controller.page).toBe(1);
    });

    it('should call getRecentProjects immediately and populate the tasks array', function () {
        expect(recentTasksService.loadTasks).toHaveBeenCalled();
        // First five tasks
        generateTasks(0, 5);
        expect(angular.equals(controller.tasks, tasks)).toEqual(true);
    });

    it('should return the list of tasks by page', function () {
        var nextPage = 2;
        var currentPage = 1;
        expect(controller.page).toEqual(currentPage);
        // Get page 2
        controller.loadTasks('next');
        scope.$digest();
        // Make sure page 2 was requested
        expect(recentTasksService.loadTasks).toHaveBeenCalledWith(nextPage);
        generateTasks(5, 5);
        // Make sure we're getting page 2
        expect(angular.equals(controller.tasks, tasks)).toEqual(true);
    });

    it('should be able to return page 3', function () {
        var nextPage = 3;
        var currentPage = 2;
        controller.page = currentPage;
        controller.loadTasks('next');
        scope.$digest();
        // Make sure page 3 was requested
        expect(recentTasksService.loadTasks).toHaveBeenCalledWith(nextPage);
        // Only two tasks on page 3
        generateTasks(10, 2);
        // Make sure we're getting page 3
        expect(angular.equals(controller.tasks, tasks)).toEqual(true);
    });

    it('should not be able to beyond the last page', function () {
        var nextPage = 4;
        var currentPage = 3;
        // Get the original task list
        var startTasks = controller.tasks;
        controller.page = currentPage;
        controller.loadTasks('next');
        scope.$digest();
        // Make sure the service was indeed called, but nothing changed on the tasks
        expect(recentTasksService.loadTasks).toHaveBeenCalledWith(nextPage);
        expect(angular.equals(startTasks, controller.tasks)).toBeTruthy();
        // Make sure we're still on page 3
        expect(controller.page).toEqual(currentPage);
    });

    it('should not go back past page 1', function () {
        var currentPage = 1;
        expect(controller.page).toEqual(currentPage);
        // Should not be able to do this
        controller.loadTasks('prev');
        scope.$digest();
        // Shouldn't get to the service
        expect(recentTasksService.loadTasks.callCount).toEqual(1);
        // Make sure we haven't changed pages
        expect(controller.page).toEqual(currentPage);
    });

    it('should call getRecentTasks() on loggedin emit', inject(function ($rootScope) {
        $rootScope.$emit('loggedin');
        scope.$digest();
        expect(recentTasksService.loadTasks.callCount).toEqual(2);
    }));
});