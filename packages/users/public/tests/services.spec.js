'use strict';

describe('LoginService', function () {
    var httpBackend, deferred, loginService, scope;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.users');
    });

    beforeEach(inject(function ($httpBackend, acLoginService, $rootScope) {
        httpBackend = $httpBackend;
        loginService = acLoginService;
        scope = $rootScope.$new();
    }));

    describe('successful login', function () {
        beforeEach(inject(function ($q) {
            deferred = $q.defer();
            deferred.resolve({
                user: {
                    _id: 1,
                    name: 'Baron von Bullshit'
                },
                redirect: 'fake.redirect'
            });
            httpBackend.whenPOST('/login').respond(deferred.promise);
        }));

        it('should emit logged in with the user and redirect on success', inject(function ($rootScope) {
            spyOn($rootScope, '$emit');
            loginService.login({
                email: 'fake@fake.com',
                name: 'fakefakefake'
            });
            httpBackend.flush();
            scope.$digest();
            expect($rootScope.$emit.mostRecentCall.args[0]).toEqual('loggedin');
            var responseEmit = $rootScope.$emit.mostRecentCall.args[1];
            expect(angular.equals(responseEmit, {
                $$state: {
                    status: 1,
                    value: {
                        user: {
                            _id: 1,
                            name: 'Baron von Bullshit'
                        },
                        redirect: 'fake.redirect'
                    }
                }
            })).toBeTruthy();
        }));
    });

    describe('unsuccessful login', function () {
        beforeEach(function () {
            httpBackend.whenPOST('/login').respond(500, '');
        });

        it('should return a rejected promise on failed login', inject(function ($rootScope) {
            spyOn($rootScope, '$emit');
            loginService.login({
                email: 'fake@fake.com',
                name: 'fakefakefake'
            }).then(function () {
                expect(false).toBeTruthy();
            }, function () {
                expect(true).toBeTruthy();
            });
            httpBackend.flush();
            scope.$digest();
            expect($rootScope.$emit).not.toHaveBeenCalled();
        }));
    });
});

describe('RegisterService', function () {

});

describe('TogglePasswordDir', function () {

});

describe('User', function () {

});
