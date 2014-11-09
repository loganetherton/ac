/*global inject:false */
'use strict';

(function () {
    /**
     * @todo When I include both the mock socket and mock Tasklist service, it seems to lose access to the socket. Why?
     */
    describe('TasklistController, mocked TasklistService', function () {
        var scope, socketMock, TasklistService, TasklistController, element;

        beforeEach(function () {
            module('mean');
            module('mean.system');
            // Inject ngRepeat template
            module("mean.templates");
            // Mock the tasklist service
            module('mean.tasklist');
        });

        //mock the controller for the same reason and include $rootScope and $controller
        beforeEach(inject(function($rootScope, $controller, $compile, $q, SocketService){
            //create an empty scope
            scope = $rootScope.$new();
            element = '<tasklist></tasklist>';
            // Mocking the socket service
            socketMock = SocketService;
            // Controller is initialized by the directive
            element = $compile(element)(scope);
            scope.$digest();
        }));

        it('should accept emitted tasks and add them to tasks array', function(){

            socketMock.receive('newTask', {
                data: {
                    $$hashKey: 'object:42',
                    user: '5434f0215d1bbcf87764b996',
                    title: 'test emit title',
                    content: 'test emit content'
                }
            });

            scope.$digest();

            expect(element.isolateScope().tasklist.tasks).toEqual([{
                                             $$hashKey: 'object:42',
                                             user: '5434f0215d1bbcf87764b996',
                                             title: 'test emit title',
                                             content: 'test emit content'
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
                                             },
                                             $$hashKey: 'object:12'
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
                                             },
                                             $$hashKey: 'object:13'
                                         }]);

        });
    });

    describe('TasklistController, TasklistService with httpBackend', function () {
        var scope, httpBackend, TasklistService, q, LogService, TasklistController;
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

            TasklistController = $controller('TasklistController', {$scope: scope});
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
            expect(TasklistController.tasks).toEqual({ data : 'data' });
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
