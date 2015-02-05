describe('AuthenticationService', function () {
    var authenticationService, user, httpBackend, scope;

    beforeEach(function () {
        module('mean');
        module('mean.system', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function (AuthenticationService, User, $httpBackend, $rootScope) {
        authenticationService = AuthenticationService;
        user = User;
        httpBackend = $httpBackend;
        scope = $rootScope.$new();
        // Remove event listeners for onStateChangeStart
        $rootScope.$$listeners.$stateChangeStart = [];
    }));

    it('should have all of the necessary methods', function () {
        expect(angular.isFunction(authenticationService.isIdentityResolved));
        expect(angular.isFunction(authenticationService.isAuthenticated));
        expect(angular.isFunction(authenticationService.isInRole));
        expect(angular.isFunction(authenticationService.isInAnyRole));
        expect(angular.isFunction(authenticationService.authenticate));
        expect(angular.isFunction(authenticationService.identity));
        // Make sure that the above functions are the only ones exposed
        expect(Object.keys(authenticationService).length).toBe(6);
    });

    describe('isIdentityResolved()', function () {
        it('should return the users identity if defined', function () {
            expect(authenticationService.isIdentityResolved()).toBe(false);
            // Set a mock identity
            authenticationService.authenticate({_id: 1});
            expect(authenticationService.isIdentityResolved()).toBe(true);
        });
    });

    describe('isAuthenticated()', function () {
        it('should return whether the user is authenticated', function () {
            expect(authenticationService.isAuthenticated()).toBe(false);
            authenticationService.authenticate({_id: 1});
            expect(authenticationService.isAuthenticated()).toBe(true);
        });
    });

    describe('isInRole()', function () {
        it('should return whether the user has a specific role', function () {
            expect(authenticationService.isInRole()).toBe(false);
            authenticationService.authenticate({_id: 1, roles: ['authenticated']});
            expect(authenticationService.isInRole('authenticated')).toBe(true);
        });
    });

    describe('isInAnyRole()', function () {
        it('should return whether the user is assigned to any role', function () {
            expect(authenticationService.isInAnyRole()).toBe(false);
            authenticationService.authenticate({_id: 1, roles: ['authenticated']});
            expect(authenticationService.isInAnyRole(['nope', 'bad'])).toBe(false);
            expect(authenticationService.isInAnyRole(['nope', 'bad', 'authenticated'])).toBe(true);
        });
    });

    describe('authenticate()', function () {
        it('should set the users identity in the AuthenticationService and the User service', function () {
            // If no user, identity should be reset
            authenticationService.authenticate(null);
            expect(authenticationService.isIdentityResolved()).toBe(true);
            expect(authenticationService.isAuthenticated()).toBe(false);
            // User service identity should also be falsy
            expect(user.identity).toBeFalsy();
            // Authenticate
            authenticationService.authenticate({_id: 1});
            // Verify user service identity set
            expect(angular.equals(user.getIdentity(), {_id: 1})).toBe(true);
            // Verify authenticationService identity set
            expect(authenticationService.isIdentityResolved()).toBe(true);
            expect(authenticationService.isAuthenticated()).toBe(true);
        });
    });

    describe('identity()', function () {
        beforeEach(inject(function (AuthorizationService) {
            // Override the initial call to authorize in app.config
            spyOn(AuthorizationService, 'authorize').andCallFake(function () {
                //console.log('fake checkAuthStateAccess');
            });
        }));

        beforeEach(function () {
            httpBackend.when('GET', '/users/me').respond({_id: 1});
        });

        // Make sure no expectGET etc calls were missed
        afterEach(function() {
            // This is necessary for the urlRouterProvider handling in app.config
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });
        it('should retrieve the users identity once and only once', function () {
            var spy = jasmine.createSpy('identity()');
            authenticationService.identity().then(spy);
            // Need to call scope.$digest() for promise to fulfill
            httpBackend.flush();
            scope.$digest();
            expect(spy).toHaveBeenCalledWith({_id: 1});
            // Verify that another call won't be made to /users/me
            // Since no call to httpBackend.flush() is made, will fail in afterEach if one is made
            var secondSpy = jasmine.createSpy('identity() again');
            authenticationService.identity().then(secondSpy);
            scope.$digest();
            expect(secondSpy).toHaveBeenCalledWith({_id: 1});
        });

        it('should retrieve the identity again when called with force', function () {
            var spy = jasmine.createSpy('identity()');
            authenticationService.identity().then(spy);
            // Need to call scope.$digest() for promise to fulfill
            httpBackend.flush();
            scope.$digest();
            expect(spy).toHaveBeenCalledWith({_id: 1});
            // Verify that another call won't be made to /users/me
            // Since no call to httpBackend.flush() is made, will fail in afterEach if one is made
            var secondSpy = jasmine.createSpy('identity() again');
            authenticationService.identity(true).then(secondSpy);
            httpBackend.flush();
            scope.$digest();
            expect(secondSpy).toHaveBeenCalledWith({_id: 1});
        });
    });
});

describe('AuthorizationService', function () {
    var state, scope, authorizationService, authenticationService;
    beforeEach(function () {
        module('mean');
        module('mean.system', function ($provide) {
            $provide.factory('User', UserMock);
            $provide.factory('AuthenticationService', AuthenticationServiceMock);
            $provide.factory('SocketService', SocketMock);
        });
    });

    beforeEach(inject(function ($state, $rootScope, $templateCache, AuthorizationService, AuthenticationService) {
        state = $state;
        scope = $rootScope.$new();
        authorizationService = AuthorizationService;
        authenticationService = AuthenticationService;
        // Set toState to authenticated
        $rootScope.toState = {
            data: {
                roles: ['authenticated']
            }
        };
        // Remove event listeners for onStateChangeStart
        $rootScope.$$listeners.$stateChangeStart = [];
        // For judging state transitions
        spyOn($state, 'go');
    }));

    it('should have the three tested methods, and nothing more', function () {
        expect(angular.isFunction(authorizationService.authorize));
        expect(angular.isFunction(authorizationService.forceCheckAuthorize));
        expect(angular.isFunction(authorizationService.checkAuthStateAccess));
        expect(Object.keys(authorizationService).length).toBe(3);
    });

    describe('authorize()', function () {
        it('should verify that the user has the role requested before making the transition',
        inject(function ($state) {
            var spy = jasmine.createSpy('success');
            authorizationService.authorize().then(spy);
            // Need to call scope.$digest() for promise to fulfill
            scope.$digest();
            expect(spy).toHaveBeenCalledWith({_id: 1, roles: ['authenticated']});
            expect($state.go).not.toHaveBeenCalled();
        }));

        it('should deny the user if the user does not have the requested role', inject(function ($state, $rootScope) {
            spyOn(console, 'log');
            $rootScope.toState = {
                data: {
                    roles: ['notAuthorized']
                }
            };
            authorizationService.authorize();
            // Need to call scope.$digest() for promise to fulfill
            scope.$digest();
            expect(console.log).toHaveBeenCalledWith('access denied');
        }));
    });

    describe('forceCheckAuthorize()', function () {
        it('should recheck authorization for the user', inject(function ($state, $rootScope) {
            // Check by normal means, then check by forcing reauth (will return different identity for testing)
            var spy = jasmine.createSpy('success');
            authorizationService.authorize().then(spy);
            scope.$digest();
            expect(spy).toHaveBeenCalledWith({_id: 1, roles: ['authenticated']});
            expect($state.go).not.toHaveBeenCalled();
            // Set user unauthenticated, then force reauth
            authenticationService.setUnauthenticated();
            authorizationService.forceCheckAuthorize();
            scope.$digest();
            expect($state.go).toHaveBeenCalledWith('auth.login');
        }));
    });

    describe('checkAuthStateAccess()', function () {
        it('should allow non-logged in users access to auth only state', inject(function ($state, AuthenticationService, $q) {
            spyOn(AuthenticationService, 'identity').andCallFake(function() {
                var deferred = $q.defer();
                scope.$apply(deferred.resolve(null));
                return deferred.promise;
            });
            authorizationService.checkAuthStateAccess();
            scope.$digest();
            expect($state.go).not.toHaveBeenCalled();
        }));

        it('should prevent logged in users from accessing the auth only states', inject(function ($state) {
            authorizationService.checkAuthStateAccess();
            scope.$digest();
            expect($state.go).toHaveBeenCalled();
            expect($state.go).toHaveBeenCalledWith('site.tasklist');
        }));
    });
});

describe('hasAuthorizationService', function () {
    var hasAuthorizationService,
    user = {
        _id: 1,
        name: 'Baron von Bullshit',
        roles: ['authenticated']
    },
    task = {
        content: 'content',
        title: 'title',
        user: {
            _id: 1
        }
    };
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.users', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function (HasAuthorizationService) {
        hasAuthorizationService = HasAuthorizationService;
    }));

    it('should allow access if the user ID is the same as the task ID', inject(function (User) {
        User.setIdentity(user);
        expect(hasAuthorizationService(task)).toBeTruthy();
    }));

    it('should deny unauthenticated users', function () {
        expect(hasAuthorizationService(task)).toBeFalsy();
    });

    it('should deny access if a task does not have a user set', inject(function (User) {
        delete task.user._id;
        User.setIdentity = user;
        expect(hasAuthorizationService(task)).toBeFalsy();
    }));

    it('should allow access to admin users', inject(function (User) {
        user.roles.push('admin');
        User.setIdentity(user);
        expect(hasAuthorizationService(task)).toBeTruthy();
    }));
});

describe('acSessionService', function () {
    var acSessionService, httpBackend;

    beforeEach(function () {
        module('mean');
        module('mean.system', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function (_acSessionService_, $httpBackend) {
        acSessionService = _acSessionService_;
        httpBackend = $httpBackend;
    }));

    it('should have one method', function () {
        expect(Object.keys(acSessionService).length).toBe(1);
    });

    describe('writeTeamToSession', function () {
        beforeEach(function () {
            httpBackend.whenPOST('/writeTeamToSession').respond('Written');
        });

        it('should make a call to /writeTeamToSession', function () {
            acSessionService.writeTeamToSession('fakeTeam').then(function (response) {
                expect(response.data).toBe('Written');
            });
            httpBackend.flush();
        });
    });
});