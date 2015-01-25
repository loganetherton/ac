describe('Header directives', function () {
    var scope, element;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.templates');
        module('mean.header', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        element = $compile('<user-dropdown></user-dropdown>')(scope);

        scope.$digest();
    }));

    it('should display the user\'s name', function () {
        expect(element.scope().headerCtrl.user.name).toEqual('Testy Tester');
    });
});