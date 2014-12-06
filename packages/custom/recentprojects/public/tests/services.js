describe('recentTaskService', function () {
    var recentTasksService, httpBackend, recentTasks;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.recentprojects', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function (RecentTasksService, $httpBackend) {
        recentTasksService = RecentTasksService;
        httpBackend = $httpBackend;
        // Intercept requests to /recentTasks/:page
        recentTasks = [
            {
                title: 'Fake Title 1',
                content: 'Fake Content 1'
            }
        ];
        httpBackend.whenGET(/.*?recentTasks.*?/).respond(recentTasks);
    }));

    it('should have all necessary methods', function () {
        expect(recentTasksService.loadTasks).toBeTruthy();
        expect(_.keys(recentTasksService).length).toEqual(1);
    });

    it('should make a GET request to /recentTasks/:page on loadTasks()', inject(function ($rootScope) {
        // Get page 1
        var response = recentTasksService.loadTasks(1);
        httpBackend.flush();
        response.then(function (data) {
            expect(data).toEqual(recentTasks);
        }, function () {
            expect(false).toBeTruthy();
        });
        $rootScope.$digest();
    }));
});