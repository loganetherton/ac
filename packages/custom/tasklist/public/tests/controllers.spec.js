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
                $provide.factory('TasklistSocketService', SocketMock);
                $provide.factory('User', UserMock);
            });
        });

        //mock the controller for the same reason and include $rootScope and $controller
        beforeEach(inject(function($rootScope, $controller, $compile, $q, TasklistSocketService){
            //create an empty scope
            scope = $rootScope.$new();
            element = '<div data-ng-controller="TasklistController as tasklistCtrl"><tasklist tasks="tasklistCtrl.tasks"></tasklist></div>';
            // Mocking the socket service
            socketMock = TasklistSocketService;
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

            expect(element.scope().tasklistCtrl.tasks).toEqual([{
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
                                             team: 1,
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
                                             team: 2,
                                             $$hashKey: 'object:13'
                                         }]);

        });
    });

    describe('TaskInsertController', function () {
        var scope, controller, global, taskInsertService;

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.acsocket');
            module('mean.taskinsert', function ($provide) {
                $provide.factory('Global', GlobalMock);
                $provide.factory('TaskInsertService', MockTaskInsertService);
                $provide.factory('User', UserMock);
            });
        });

        beforeEach(inject(function ($rootScope, $controller, Global, TaskInsertService) {
            scope = $rootScope.$new();
            taskInsertService = TaskInsertService;

            spyOn(TaskInsertService, 'create').andCallThrough();
            controller = $controller('TaskInsertController', {$scope: scope});

            global = Global;
        }));

        it('should provide access to global strings', function () {
            expect(controller.strings.name).toBeDefined();
            expect(controller.strings.project).toBeDefined();
        });

        it('should call TaskInsertService.create() when a new task is submitted', function () {
            controller.task.title = 'fakeTitle';
            controller.task.content = 'fakeContent';
            controller.create(true);

            expect(taskInsertService.create).toHaveBeenCalledWith(true,
                {dependencies: [], title: 'fakeTitle', content: 'fakeContent'});
        });
    });
}());
