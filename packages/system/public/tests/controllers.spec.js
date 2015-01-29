/*global inject:false */
'use strict';

ddescribe('IndexController', function () {
    var scope, controller;

    beforeEach(function () {
        module('mean');
        module('mean.system', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function ($rootScope, $controller) {
        scope = $rootScope.$new();
        controller = $controller('IndexController', {$scope: scope});

    }));

    it('should have all necessary functions and properties', function () {
        expect(controller.noNavPage).toBeTruthy();
        expect(controller.rightPaneLarge).toBeTruthy();
        expect(controller.main).toBeTruthy();
    });

    it('should be able to determine if the navigation should be present via noNavPage', function () {

    });

    it('should listen for rightPaneSizeChange and change the rightPaneLarge property', function () {

    });
});