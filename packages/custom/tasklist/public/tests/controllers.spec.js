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
            module('mean.tasklist', function ($provide) {
                $provide.factory('TasklistService', MockTasklistService);
                $provide.factory('SocketService', SocketMock);
            });
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

    ddescribe('TasklistInsertController', function () {
        var scope, controller, global, tasklistService;

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.factory('Global', GlobalMock);
                $provide.factory('TasklistService', MockTasklistService);
            });
        });

        beforeEach(inject(function ($rootScope, $controller, Global, TasklistService) {
            scope = $rootScope.$new();
            tasklistService = TasklistService;

            spyOn(tasklistService, 'create').andCallThrough();
            controller = $controller('TasklistInsertController', {$scope: scope});

            global = Global;
        }));

        it('should provide access to global strings', function () {
            expect(controller.strings.name).toBeDefined();
            expect(controller.strings.project).toBeDefined();
        });

        it('should call TasklistService.create() when a new task is submitted', function () {
            controller.title = 'fakeTitle';
            controller.content = 'fakeContent';
            controller.create(true);

            expect(tasklistService.create).toHaveBeenCalledWith(true, 'fakeTitle', 'fakeContent');
        });
    });
}());
