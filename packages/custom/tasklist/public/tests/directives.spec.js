(function () {
    describe('directive: tasklist', function () {
        var scope, element, elementWithCtrl, TasklistService;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            module("mean.templates");
            module('mean.tasklist', function ($provide) {
                $provide.factory('TasklistService', MockTasklistService);
                $provide.factory('TasklistSocketService', SocketMock);
                $provide.factory('User', UserMock);
            });
        });

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            elementWithCtrl = '<div data-ng-controller="TasklistController as tasklistCtrl"><tasklist tasks="tasklistCtrl.tasks"></tasklist></div>';

            // Compile element and digest
            elementWithCtrl = $compile(elementWithCtrl)(scope);
            scope.$digest();
        }));

        it('should immediately call Tasklist.init() and add the return to $scope.tasks', function () {
            // I've placed this call onto the directive
            expect(elementWithCtrl.scope().tasklistCtrl.tasks).toEqual([{
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

        it('should call hasAuthTask for the tasks', function () {
            expect(elementWithCtrl.html().match(/<span data-ng-if="hasAuthTask\(task.team\)"/).length).toEqual(1);
        });
    });
})();