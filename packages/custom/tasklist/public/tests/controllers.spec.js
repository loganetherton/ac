/*global inject:false */
'use strict';

(function () {
    /**
     * @todo When I include both the mock socket and mock Tasklist service, it seems to lose access to the socket. Why?
     */
    describe('TasklistController, mocked TasklistService', function () {
        var scope, socketMock, TasklistService;

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist');
        });

        //mock the controller for the same reason and include $rootScope and $controller
        beforeEach(inject(function($rootScope, $controller, $q){
            //create an empty scope
            scope = $rootScope.$new();
            socketMock = new SocketMock($rootScope);

            TasklistService = new MockTasklistService($q);

            // Declare controller, inject mock socket and mock tasklist service
            $controller('TasklistController', {$scope: scope, TasklistService: TasklistService, SocketService: socketMock});

            scope.$digest();
        }));

        it('should immediately call Tasklist.init() and add the return to $scope.tasks', function () {
            expect(scope.tasks).toEqual([{
                                             __v: 0,
                                             _id: '5458888a70b39cf36ca711e7',
                                             content: 'testContent',
                                             created: '2014-11-04T08:04:26.526Z',
                                             title: 'testTitle',
                                             user: {
                                                 _id: '5434f0215d1bbcf87764b996',
                                                 name: 'Logan Etherton',
                                                 username: 'loganetherton'
                                             }
                                         }, {
                                             __v: 0,
                                             _id: '545882cc37f38bcf69f0b82d',
                                             content: 'testContent2',
                                             created: '2014-11-04T08:04:26.526Z',
                                             title: 'testTitle2',
                                             user: {
                                                 _id: '5434f0215d1bbcf87764b996',
                                                 name: 'Logan Etherton',
                                                 username: 'loganetherton'
                                             }
                                         }]);
        });

        it('should accept emitted tasks and add them to tasks array', function(){
            socketMock.receive('newTask', {
                data: {
                    $$hashKey: 'object:42',
                    user: '5434f0215d1bbcf87764b996',
                    title: 'test title',
                    content: 'test content'
                }
            });

            expect(scope.tasks).toEqual([{
                                             $$hashKey: 'object:42',
                                             user: '5434f0215d1bbcf87764b996',
                                             title: 'test title',
                                             content: 'test content'
                                         }, {
                                             __v: 0,
                                             _id: '5458888a70b39cf36ca711e7',
                                             content: 'testContent',
                                             created: '2014-11-04T08:04:26.526Z',
                                             title: 'testTitle',
                                             user: {
                                                 _id: '5434f0215d1bbcf87764b996',
                                                 name: 'Logan Etherton',
                                                 username: 'loganetherton'
                                             }
                                         }, {
                                             __v: 0,
                                             _id: '545882cc37f38bcf69f0b82d',
                                             content: 'testContent2',
                                             created: '2014-11-04T08:04:26.526Z',
                                             title: 'testTitle2',
                                             user: {
                                                 _id: '5434f0215d1bbcf87764b996',
                                                 name: 'Logan Etherton',
                                                 username: 'loganetherton'
                                             }
                                         }]);

        });
    });

    describe('TasklistController, TasklistService with httpBackend', function () {
        var scope, httpBackend, TasklistService, q, LogService;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist');
        });

        beforeEach(inject(function ($rootScope, $controller, $httpBackend, _TasklistService_, $q, _LogService_) {
            scope = $rootScope.$new();
            httpBackend = $httpBackend;
            TasklistService = _TasklistService_;
            LogService = _LogService_;
            q = $q;

            // Make sure the log service was called
            spyOn(LogService, 'error');

            $controller('TasklistController', {$scope: scope});
        }));

        // Make sure no expectGET etc calls were missed
        afterEach(function() {
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });

        it('should respond via httpBackend successfully', function () {
            var deferred = q.defer();
            deferred.resolve({data: 'data'});
            httpBackend.whenGET('/tasklist').respond(deferred.promise);
            httpBackend.flush();
            scope.$digest();
            expect(scope.tasks).toEqual({ data : 'data' });
        });

        it('should handle errors from TasklistService', function () {
            var deferred = q.defer();
            deferred.reject({
                data: {
                    error: 'this is an error'
                }
            });
            httpBackend.whenGET('/tasklist').respond(deferred.promise);
            httpBackend.flush();
            scope.$digest();
            expect(LogService.error).toHaveBeenCalled()
        });
    });

    describe('TasklistInsertController', function () {

    });
}());
