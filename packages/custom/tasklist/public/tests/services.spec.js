(function () {
    describe('Service: SocketService', function () {
        var socketService, socket;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.factory('User', UserMock);
            });
        });

        beforeEach(inject(function (SocketService) {
            socketService = SocketService;
        }));

        beforeEach(function () {
            var baseUrl = 'http://localhost:8282/task';
            socket = io.connect(baseUrl);
        });

        it('should have init, emit, and on functions', function () {
            expect(angular.isFunction(socketService.init)).toBeTruthy();
            expect(angular.isFunction(socketService.on)).toBeTruthy();
            expect(angular.isFunction(socketService.emit)).toBeTruthy();
        });

        describe('init()', function () {
            it('should remove all event listeners on init', function () {
                spyOn(socket, 'removeAllListeners');
                socketService.init();
                expect(socket.removeAllListeners).toHaveBeenCalled();
            });
        });

        describe('on()', function () {
            it('should call socket.on', function () {
                spyOn(socket, 'on');
                socketService.on('test');
                expect(socket.on.mostRecentCall.args[0]).toEqual('test');
            });
        });

        describe('emit()', function () {
            it('should call socket.emit', function () {
                spyOn(socket, 'emit');
                socketService.emit('test');
                expect(socket.emit.mostRecentCall.args[0]).toEqual('test');
            });
        });
    });

    describe('Service: TasklistService', function () {
        var scope, tasklistService, httpBackend, socketService, logService, q, global, user;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.factory('User', UserMock);
            });
        });

        beforeEach(inject(function ($rootScope, TasklistService, $httpBackend, Global, LogService, $q, SocketService, User) {
            scope = $rootScope.$new();
            tasklistService = TasklistService;
            httpBackend = $httpBackend;
            logService = LogService;
            socketService = SocketService;
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
            var deferred;
            beforeEach(function () {
                deferred = q.defer();
                httpBackend.whenGET(/tasks\/user.*/).respond(deferred.promise);
                // Set a basic user identity
                user.identity = {
                    _id: 1,
                    name: 'Some bullshit',
                    email: 'some@bullshit.com'
                };
            });

            it('should return an initial listing of tasks: init()', function () {
                deferred.resolve({data: 'data'});
                var responsePromise = tasklistService.init();
                httpBackend.flush();
                responsePromise.then(function (data) {
                    expect(data).toEqual({data: 'data'});
                }, function (error) {
                    // Fail
                    expect(error).toBe(null);
                });
            });

            it('should return an error message if failing to retrieve initial tasklist: init()', function () {
                spyOn(logService, 'error');
                var deferred = q.defer();
                deferred.reject({data: 'failed'});
                var responsePromise = tasklistService.init();
                httpBackend.flush();
                responsePromise.then(function (data) {

                }, function (error) {
                    expect(error).toEqual({data: 'failed'});
                });
            });
        });

        describe('create()', function () {
            describe('success', function () {
                var deferred, task;

                beforeEach(function () {
                    deferred = q.defer();
                    // Make fake post
                    httpBackend.whenPOST('/newTask', task).respond(deferred.promise);
                    task = {
                        user: 1,
                        title: 'title',
                        content: 'content'
                    };
                });

                it('should not allow invalid content to proceed', function () {
                    var responsePromise = tasklistService.create(false);
                    responsePromise.then(function () {}, function (error) {
                        expect(error).toEqual('Invalid task model');
                    });
                });

                it('should return the newly submitted task on success', function () {
                    var responsePromise = tasklistService.create(true, task.title, task.content);
                    // Handle response
                    responsePromise.then(function (data) {
                        expect(data).toEqual({ user : 1, title : 'title', content : 'content' });
                    }, function (error) {

                    });
                    httpBackend.flush();
                });

                it('should emit the newly submitted task on success', function () {
                    spyOn(socketService, 'emit');
                    tasklistService.create(true, task.title, task.content);
                    httpBackend.flush();
                    expect(socketService.emit).toHaveBeenCalled();
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

                    tasklistService.create(true, task.title, task.content);
                    httpBackend.flush();
                    expect(logService.error).toHaveBeenCalled();
                });

                it('should return an error message on failure to save model: create()', function () {
                    var responsePromise = tasklistService.create(true, task.title, task.content);
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
})();