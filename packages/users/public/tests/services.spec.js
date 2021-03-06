'use strict';

var user = {
    _id: 1,
    name: 'Baron von Bullshit',
    teams: ['111']
};

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
                user: user,
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
                        user: user,
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
    var httpBackend, deferred, registerService, scope;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.users');
    });

    beforeEach(inject(function ($httpBackend, acRegisterService, $rootScope) {
        httpBackend = $httpBackend;
        registerService = acRegisterService;
        scope = $rootScope.$new();
    }));

    describe('success registration', function () {
        beforeEach(inject(function ($q) {
            deferred = $q.defer();
            deferred.resolve({
                user: user,
                redirect: 'fake.redirect'
            });
            httpBackend.whenPOST('/register').respond(deferred.promise);
        }));
        it('should emit logged in with user and redirect on success', inject(function ($rootScope) {
            spyOn($rootScope, '$emit');
            registerService.register({
                email: 'fake@fake.com',
                name: 'fakefakefake',
                password: 'password',
                confirmPassword: 'password'
            });
            httpBackend.flush();
            scope.$digest();
            expect($rootScope.$emit.mostRecentCall.args[0]).toEqual('loggedin');
            var responseEmit = $rootScope.$emit.mostRecentCall.args[1];
            expect(angular.equals(responseEmit, {
                $$state: {
                    status: 1,
                    value: {
                        user: user,
                        redirect: 'fake.redirect'
                    }
                }
            })).toBeTruthy();
        }));
    });

    describe('unsuccessful registration', function () {
        beforeEach(function () {
            httpBackend.whenPOST('/register').respond(500, '');
        });

        it('should return a rejected promise on failed login', inject(function ($rootScope) {
            spyOn($rootScope, '$emit');
            registerService.register({
                email: 'fake@fake.com',
                name: 'fakefakefake',
                password: 'password',
                confirmPassword: 'badPassword'
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

describe('User', function () {
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.users');
    });

    // It seems as though Karma won't let you test services as getters/setters? PhantomJS always crashes -- Logan 11/24/14
    it('should get/set the user identity', inject(function (User) {
        User.setIdentity(user);
        expect(User.getIdentity()).toBe(user);
    }));

    it('should set identity on rootScope when identity is set as a setter', inject(function ($rootScope, User) {
        User.setIdentity(user);
        expect($rootScope.user).toBe(user);
    }));

    it('should expose the users team on the User service', inject(function (User) {
        User.setIdentity(user);
        expect(User.getIdentity().teams.length).toEqual(1);
        expect(User.getIdentity().teams[0]).toEqual('111');
    }));
});
