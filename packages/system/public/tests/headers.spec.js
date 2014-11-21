'use strict';

(function () {
    describe('HeaderController', function () {
        beforeEach(function () {
            module('mean');
            module('mean.system', function ($provide) {
                $provide.factory('User', UserMock);
            });
        });

        var scope, HeaderController;

        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            HeaderController = $controller('HeaderController', {
                $scope: scope
            });
        }));

        it('should expose some global scope', function () {
            expect(scope.global).toBeTruthy();
        });
    });
})();
