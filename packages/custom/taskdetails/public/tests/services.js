describe('TaskService', function () {
    var taskService, location, httpBackend, rootScope;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.taskdetails', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function (TaskService, $location, $httpBackend, $rootScope) {
        taskService = TaskService;
        location = $location;
        httpBackend = $httpBackend;
        rootScope = $rootScope;
    }));

    // Make sure no expectGET etc calls were missed
    afterEach(function() {
        httpBackend.verifyNoOutstandingExpectation();
        httpBackend.verifyNoOutstandingRequest();
    });

    it('should return an error for an invalid task ID', function () {
        httpBackend.whenGET('/task/badId').respond(400);
        taskService.getTask('badId').then(function () {}, function (err) {
            expect(err).toBe('Invalid task ID');
        });
        httpBackend.flush();
        rootScope.$digest();
    });

    it('should be able to pull a single task', function () {
        // Respond with a task
        httpBackend.whenGET('/task/goodId').respond({
            title: 'Task Title',
            content: 'Task Content'
        });
        taskService.getTask('goodId').then(function (data) {
            expect(angular.equals(data, {
                title: 'Task Title',
                content: 'Task Content'
            })).toBe(true);
        }, function () {});
        httpBackend.flush();
        rootScope.$digest();
    });

    // expect(karma).toGo(fuckItself);
});