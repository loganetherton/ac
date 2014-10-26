/*global dump:false */

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

            element = compile('<div enter="panel" leave>Enter here!</div>')(scope);
            scope.$digest();
        }));

        it('should have the panel class added on mouseenter', function () {
            expect(element.attr('class')).not.toMatch(/panel/);
            element.triggerHandler('mouseenter');
            expect(element.attr('class')).toMatch(/panel/);
            element.triggerHandler('mouseleave');
            expect(element.attr('class')).not.toMatch(/panel/);
        });
    });

    describe('controller:systemTest', function () {
        var scope, SystemTestCtrl;

        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            SystemTestCtrl = $controller('SystemTestCtrl', {
                $scope: scope
            });
        }));

        it('should call console.log on loadMoreTweets', function () {
            spyOn(console, 'log');
            scope.loadMoreTweets();
            expect(console.log).toHaveBeenCalledWith('loading tweets');
        });
    });

    describe('controller:SuperheroDirController', function () {
        var scope, SuperheroDirController;
        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($controller, $rootScope) {
            scope = $rootScope.$new();

            SuperheroDirController = $controller('SuperheroDirController', {
                $scope: scope
            });
        }));

        it('should give access to the strength method', function () {
            expect(SuperheroDirController.addStrength).toBeDefined();
            expect(scope.abilities).toEqual([]);
            SuperheroDirController.addStrength();
            expect(scope.abilities).toEqual(['strength']);
        });
    });

    describe('directive:superhero', function () {
        var scope, compile, supermanElement, flashElement;
        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            compile = $compile;
            // Watch console.log
            spyOn(console, 'log');
            // Compile element
            supermanElement = compile('<button superhero class="button" strength speed flight>Superman</button>')(scope);
            flashElement = compile('<button superhero class="button" speed>Flash</button>')(scope);
            // Fire watchers
            scope.$digest();
        }));

        it('should write an array of flight, speed, and strength to the log on click', function () {
            supermanElement.triggerHandler('click');
            expect(console.log).toHaveBeenCalledWith(['strength', 'speed', 'flight']);
            flashElement.triggerHandler('click');
            expect(console.log).toHaveBeenCalledWith(['speed']);
        });
    });

    //describe('directive:kid', function () {
    //    var scope, compile, kidElement;
    //    beforeEach(function () {
    //        module('mean');
    //        module('mean.system');
    //        module(function($provide) {
    //            $provide.value('$log', console);
    //        });
    //    });
    //
    //    beforeEach(inject(function ($rootScope, $compile) {
    //        scope = $rootScope.$new();
    //        compile = $compile;
    //
    //        spyOn(console, 'log');
    //
    //        kidElement = compile('<kid done="logChore(task)"></kid>')(scope);
    //        scope.$digest();
    //    }));
    //
    //    it('should call console.log when the button is clicked and say the chore is done', function () {
    //        kidElement.find('button').click();
    //        expect(console.log).toHaveBeenCalledWith('stuff is done');
    //    });
    //});

    describe('directive:drink', function () {
        var scope, compile, element;

        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($rootScope, $compile) {
            scope = $rootScope.$new();
            compile = $compile;
            element = compile('<div drink flavor="strawberry"></div>')(scope);
            scope.$digest();
        }));

        it('should display strawberry as the drink', function () {
            expect(element.text()).toEqual('strawberry');
        });
    });

    describe('directive:drinktwowaybinding', function () {
        var scope, element, compile, controllerScope, elementScope, controller, DrinkController;

        beforeEach(function () {
            module('mean');
            module('mean.system');
        });

        beforeEach(inject(function ($controller, $rootScope, $compile) {
            scope = $rootScope.$new();
            compile = $compile;
            controller = $controller;
            // Note that we don't need the controller here, just the scope item
            scope.ctrlFlavor = 'blackberry';
            // Compile element
            element = compile('<div drinktwowaybinding flavor="ctrlFlavor"></div>')(scope);
            // scope is the same thing as elementScope here
            //elementScope = element.find('div').scope();
            scope.$digest();
        }));

        it('should show the default value of ctrlFlavor', function () {
            expect(element.find('input').val()).toEqual('blackberry');
        });
    });
})();
