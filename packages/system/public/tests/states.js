describe('States', function () {
    var rootScope, state, injector, templateCache, authorizationServiceMock, taskServiceMock;
    beforeEach(function () {
        module('mean');
        module('mean.system', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.value('AuthorizationService', authorizationServiceMock = {});
            $provide.value('TaskService', taskServiceMock = {});
        });
    });

    beforeEach(inject(function ($rootScope, $state, $injector, $templateCache) {
        rootScope = $rootScope;
        state = $state;
        injector = $injector;
        templateCache = $templateCache;

        templateCache.put('users/views/index.html');
    }));

    describe('auth', function () {
        it('should call authorizationService on state change', function () {
            authorizationServiceMock.checkAuthStateAccess = jasmine.createSpy('checkAuthStateAccess');
            state.go('auth');
            rootScope.$digest();
            expect(authorizationServiceMock.checkAuthStateAccess).toHaveBeenCalled();
        });
    });

    describe('tasklist', function () {
        it('should call authorizationService on state change', function () {
            authorizationServiceMock.authorize = jasmine.createSpy('authorize');
            state.go('site.tasklist');
            rootScope.$digest();
            expect(authorizationServiceMock.authorize).toHaveBeenCalled();
        });
    });

    describe('task', function () {
        // Create an object ID of 24 ones
        var objectId = Array.apply(null, Array(24)).map(function(){return 1}).join('');
        it('should call authorizationService on state change', function () {
            authorizationServiceMock.authorize = jasmine.createSpy('authorize');
            state.go('site.task');
            rootScope.$digest();
            expect(authorizationServiceMock.authorize).toHaveBeenCalled();
        });

        it('should be able to parse the taskId', function () {
            expect(state.href('site.task', {taskId: objectId})).toEqual('#!/task/' + objectId);
        });

        //// Fucking hell, state params is not accessible within karma...
        //it('should check for a valid object ID in resolve', function () {
        //    //spyOn(state, 'go').andCallFake(function(state, params) {
        //    //    console.log(state);
        //    //    console.log(params);
        //    //});
        //    taskServiceMock.checkValidId = jasmine.createSpy('checkValidId');
        //    state.go('site.task', {taskId: objectId});
        //    rootScope.$digest();
        //    expect(taskServiceMock.checkValidId).toHaveBeenCalled();
        //    //console.log(state.current.name);
        //});
    });
});