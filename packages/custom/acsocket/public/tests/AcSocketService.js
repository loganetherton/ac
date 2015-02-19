describe('AcSocketService', function () {
    var acSocketService, rootScope;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.acsocket', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });
    beforeEach(inject(function (AcSocketService, $rootScope) {
        acSocketService = AcSocketService;
        rootScope = $rootScope;
    }));

    it('should have getSocket, on, and emit functions', function () {
        expect(acSocketService.getSocket).toBeDefined();
        expect(acSocketService.on).toBeDefined();
        expect(acSocketService.emit).toBeDefined();
    });

    it('should call getSocket() to reference the correct socket on all emit() and on() calls', function () {
        spyOn(acSocketService, 'getSocket').andCallThrough();
        // Attach event listener
        acSocketService.on('test', function () {});
        expect(acSocketService.getSocket).toHaveBeenCalled();
        // Emit
        acSocketService.emit('test');
        expect(acSocketService.getSocket).toHaveBeenCalled();
    });
});
