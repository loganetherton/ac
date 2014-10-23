'use strict';

(function () {
    describe('MEAN controllers', function () {
        describe('IndexController', function () {
            beforeEach(function () {
                module('mean');
                module('mean.system');
            });

            var scope, IndexController;

            beforeEach(inject(function ($controller, $rootScope) {
                scope = $rootScope.$new();

                IndexController = $controller('IndexController', {
                    $scope: scope
                });
            }));

            it('should expose some global scope', function () {
                expect(scope.global).toBeTruthy();
            });
        });
    });

    describe('superman directive', function () {
        var scope, element, compile;
        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope;
            compile = $compile;

            // Compile element
            element = compile('<superman></superman>')(scope);
            // Fire watchers
            scope.$digest();
        }));

        it('should say here I am to save the day', function () {
            // Check the output
            expect(element.html()).toContain('<div>Here I am to save the day!</div>');
        });
    });

    describe('directive: enter', function () {
        var element, scope, compile;
        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope;
            compile = $compile;

            spyOn(console, 'log');

            element = compile('<div enter>Enter here!</div>')(scope);
            scope.$digest();
        }));

        it('should call console.log on mousenter', function () {
            expect(element.text()).toContain('Enter here!');
            element.triggerHandler('mouseenter');
            expect(console.log).toHaveBeenCalledWith('hello');
        });
    });
})();
