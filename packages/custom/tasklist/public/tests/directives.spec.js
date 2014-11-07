(function () {
    ddescribe('directive: tasklist', function () {
        var scope, element, hasAuthorizationService, TasklistService;
        beforeEach(function () {
            module('mean');
            module('mean.system');
            //module('mean.tasklist');

            module("mean.templates");
            module('mean.tasklist', function ($provide) {
                $provide.value('TasklistService', MockTasklistService);
            });

            //inject(function (_hasAuthorizationService_) {
            //    hasAuthorizationService = _hasAuthorizationService_;
            //});
        });

        beforeEach(inject(function ($rootScope, $compile, $controller, $q) {
            scope = $rootScope.$new();
            element = '<tasklist></tasklist>';

            TasklistService = new MockTasklistService($q);

            // Declare controller, inject mock socket and mock tasklist service
            //TasklistController = $controller('TasklistController as tasklist', {$scope: scope, TasklistService: TasklistService});
            //
            //scope.$digest();

            //console.log(TasklistController.tasks);

            //console.log(scope.tasklist.tasks);
            // Compile element and digest
            element = $compile(element)(scope);
            scope.$digest();
            //var e = $compile('<div><ul><li ng-repeat="item in [1,3,5,7,9]">{{item}}</li></ul></div>')(scope);
            //scope.$digest();
            //console.log(e.html());
        }));

        it('should have the hasAuthorizationService and it should be accessible from the directive scope', function () {
            expect(element.isolateScope().hasAuthorization).toBeTruthy();
        });

        it('should immediately call Tasklist.init() and add the return to $scope.tasks', function () {
            // I've placed this call onto the directive
            expect(element.isolateScope().tasklist.tasks).toEqual([{
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
})();