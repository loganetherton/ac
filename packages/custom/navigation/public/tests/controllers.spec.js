'use strict';

describe('NavigationController', function () {
    var scope, navigationController;

    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.navigation', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        navigationController = $controller('NavigationController', {$scope: scope});
    }));

    describe('$rootScope.$on logged in', function () {
        it('should set the user as authenticated on loggedin emit', function () {
            expect(navigationController.global.authenticated).toBeFalsy();
            scope.$emit('loggedin');
            expect(navigationController.global.authenticated).toBeTruthy()
        });
    });
});