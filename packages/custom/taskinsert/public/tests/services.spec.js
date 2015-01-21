describe('TaskInsertService', function () {
    var scope, taskInsertService, httpBackend, socketService, logService, q, global, user;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.taskinsert', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.factory('AcSocketService', SocketMock);
        });
    });

    beforeEach(inject(function ($rootScope, TaskInsertService, $httpBackend, Global, LogService, $q, TasklistSocketService, User) {
        scope = $rootScope.$new();
        taskInsertService = TaskInsertService;
        httpBackend = $httpBackend;
        logService = LogService;
        socketService = TasklistSocketService;
        user = User;
        // Mock the userID for global
        window.user = {
            _id: 1
        };
        global = Global;
        global.user = window.user;
        q = $q;
    }));

    describe('create()', function () {
        describe('success', function () {
            var deferred, task;

            beforeEach(function () {
                deferred = q.defer();
                // Make fake post
                httpBackend.whenPOST('/newTask').respond('ok');
                task = {
                    title: 'title',
                    content: 'content'
                };
            });

            it('should not allow invalid content to proceed', function () {
                var responsePromise = taskInsertService.create(false);
                responsePromise.then(function () {}, function (error) {
                    expect(error).toEqual('Invalid task model');
                });
            });

            it('should emit the newly submitted task on success', function () {
                spyOn(socketService, 'emit');
                taskInsertService.create(true, task.title, task.content).then(function () {
                    expect(socketService.emit).toHaveBeenCalled();
                });
                httpBackend.flush();
            });
        });

        describe('failure', function () {
            var task;
            beforeEach(function () {
                // Mock failure
                httpBackend.whenPOST('/newTask').respond(500);
                task = {
                    user: 1,
                    title: 'title',
                    content: 'content'
                };
            });

            it('should write to log on failure to save model: create()', function () {
                spyOn(logService, 'error');

                taskInsertService.create(true, {title: task.title, content: task.content, dependencies: []});
                httpBackend.flush();
                expect(logService.error).toHaveBeenCalled();
            });

            it('should return an error message on failure to save model: create()', function () {
                var responsePromise = taskInsertService.create(true, task.title, task.content);
                //Handle response
                responsePromise.then(function (data) {

                }, function (error) {
                    expect(error).toEqual('Failed to save new task');
                });
                httpBackend.flush();
            });
        });
    });
});