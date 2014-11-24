'use strict';

describe('TogglePassword directive', function () {
    var scope, element;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.users');
    });

    beforeEach(inject(function ($rootScope, $compile) {
        scope = $rootScope.$new();
        element = '<div data-ng-controller="LoginCtrl as loginCtrl"><ac-toggle-password></ac-toggle-password></div>';

        // Compile element and digest
        element = $compile(element)(scope);
        scope.$digest();
    }));

    it('should change the scope input object on click', function () {
        var button = element.find('ac-toggle-password');
        expect(element.scope().passwordInput.type).toBe('password');
        expect(element.scope().passwordInput.placeholder).toBe('Password');
        expect(element.scope().passwordInput.iconClass).toBe('');
        expect(element.scope().passwordInput.tooltipText).toBe('Show password');
        browserTrigger(button, 'click');
        expect(element.scope().passwordInput.type).toBe('text');
        expect(element.scope().passwordInput.placeholder).toBe('Visible Password');
        expect(element.scope().passwordInput.iconClass).toBe('icon_hide_password');
        expect(element.scope().passwordInput.tooltipText).toBe('Hide password');
    });
});