(function () {
    describe('Service: TasklistSocketService', function () {
        var socketService, socket, socketParent;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.factory('User', UserMock);
                $provide.factory('AcSocketService', SocketMock);
            });
        });

        beforeEach(inject(function (TasklistSocketService, AcSocketService) {
            socketService = TasklistSocketService;
            socketParent = AcSocketService;
        }));

        beforeEach(function () {
            var baseUrl = 'http://localhost:3000/task';
            socket = io.connect(baseUrl);
        });

        it('should have init, emit, and on functions', function () {
            expect(angular.isFunction(socketService.init)).toBeTruthy();
            expect(angular.isFunction(socketService.on)).toBeTruthy();
            expect(angular.isFunction(socketService.emit)).toBeTruthy();
        });

        // Not sure I really need this
        //describe('init()', function () {
        //    it('should remove all event listeners on init', function () {
        //        spyOn(socket, 'removeAllListeners');
        //        socketService.init();
        //        expect(socket.removeAllListeners).toHaveBeenCalled();
        //    });
        //});

        describe('on()', function () {
            it('should call socket.on', function () {
                spyOn(socketParent, 'on');
                socketService.on('test');
                expect(socketParent.on.mostRecentCall.args[0]).toEqual('test');
            });
        });

        describe('emit()', function () {
            it('should call socket.emit', function () {
                spyOn(socketParent, 'emit');
                socketService.emit('test');
                expect(socketParent.emit.mostRecentCall.args[0]).toEqual('test');
            });
        });
    });

    describe('Service: TasklistService', function () {
        var scope, taskInsertService, httpBackend, socketService, logService, q, global, user;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.factory('User', UserMock);
                $provide.factory('AcSocketService', SocketMock);

            });
        });

        beforeEach(inject(function ($rootScope, TasklistService, $httpBackend, Global, LogService, $q, TasklistSocketService, User) {
            scope = $rootScope.$new();
            taskInsertService = TasklistService;
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

        // Make sure no expectGET etc calls were missed
        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        describe('init()', function () {
            it('should return an initial listing of tasks: init()', function () {
                httpBackend.whenGET(/tasks\/team\/.*/).respond({data: 'data'});
                var responsePromise = taskInsertService.init();
                httpBackend.flush();
                responsePromise.then(function (data) {
                    expect(data).toEqual({data: 'data'});
                }, function (error) {
                    // Fail
                    expect(error).toBe(null);
                });
            });

            it('should return an error message if failing to retrieve initial tasklist: init()', function () {
                httpBackend.whenGET(/tasks\/team\/.*/).respond(400, {data: 'failed'});
                spyOn(logService, 'error');
                var responsePromise = taskInsertService.init();
                httpBackend.flush();
                responsePromise.then(function (data) {
                    expect(data).not.toBeDefined();
                }, function (error) {
                    expect(angular.equals(error, {data:{error:"Could not get tasklist"}})).toBe(true);
                });
            });
        });
    });
})();