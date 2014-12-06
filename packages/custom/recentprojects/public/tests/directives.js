describe('directive:recentProjects', function () {
    var scope, element, ProjectService, controller;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.header');
        module("mean.templates");
        module('mean.recentprojects', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.factory('ProjectService', ProjectServiceMock);
        });
    });

    beforeEach(inject(function ($rootScope, $compile, $controller, $templateCache) {
        scope = $rootScope.$new();
        // Then create the directive
        element = '<recent-tasks></recent-tasks>';
        element = $compile(element)(scope);
        scope.$digest();
    }));

    it('should recheck the tasks on open to the first page', function () {
        spyOn(element.isolateScope().recentProjectsCtrl, 'loadTasks');
        // Open and make sure loadTasks has been called
        browserTrigger(element, 'click');
        expect(element.isolateScope().recentProjectsCtrl.loadTasks).toHaveBeenCalled();
        // Close then open again
        browserTrigger(element, 'click');
        browserTrigger(element, 'click');
        // Make sure called again, since on first page
        expect(element.isolateScope().recentProjectsCtrl.loadTasks.callCount).toEqual(2);
    });

    it('should change the open property on open and close', function () {
        expect(element.isolateScope().closed).toBe(true);
        browserTrigger(element, 'click');
        expect(element.isolateScope().closed).toBe(false);
        browserTrigger(element, 'click');
        expect(element.isolateScope().closed).toBe(true);
    });

    it('should be able to call the next page on next', function () {
        spyOn(element.isolateScope().recentProjectsCtrl, 'loadTasks');
        // Open
        browserTrigger(element, 'click');
        // Click next page
        browserTrigger(element.find('.nextPage'), 'click');
        expect(element.isolateScope().recentProjectsCtrl.loadTasks.callCount).toEqual(2);
        expect(element.isolateScope().recentProjectsCtrl.loadTasks).toHaveBeenCalledWith('next');
    });

    it('should be able to call the previous page on prev', function () {
        spyOn(element.isolateScope().recentProjectsCtrl, 'loadTasks');
        // Open
        browserTrigger(element, 'click');
        // Click next page
        browserTrigger(element.find('.prevPage'), 'click');
        expect(element.isolateScope().recentProjectsCtrl.loadTasks.callCount).toEqual(2);
        expect(element.isolateScope().recentProjectsCtrl.loadTasks).toHaveBeenCalledWith('prev');
    });
});