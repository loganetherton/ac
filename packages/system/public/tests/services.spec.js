describe('AuthenticationService', function () {
    var authenticationService, user, httpBackend, rootScope;

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
        rootScope = $rootScope.$new();
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
            expect(angular.equals(user.identity, {_id: 1})).toBe(true);
            // Verify authenticationService identity set
            expect(authenticationService.isIdentityResolved()).toBe(true);
            expect(authenticationService.isAuthenticated()).toBe(true);
        });
    });

    describe('identity()', function () {
        beforeEach(function () {
            httpBackend.when('GET', '/users/me').respond({_id: 1});
        });

        // Make sure no expectGET etc calls were missed
        afterEach(function() {
            // This is necessary for the initial auth request made in app.run
            httpBackend.flush();
            //rootScope.$digest();
            httpBackend.verifyNoOutstandingExpectation();
            httpBackend.verifyNoOutstandingRequest();
        });
        it('should retrieve the users identity if not previously defined', function () {
            var identityResponse = authenticationService.identity();
            httpBackend.flush();
            identityResponse.then(function () {
                expect(authenticationService.isIdentityResolved()).toBe(true);
                expect(authenticationService.isAuthenticated()).toBe(true);
            });
        });

        it('should return the same identity when called again, rather than getting identity again', function () {
            var identityResponse = authenticationService.identity();
            httpBackend.flush();
            identityResponse.then(function () {
                // This will fail due to outstanding requests if another one is made
                authenticationService.identity();
            });
        });

        it('should retrieve the identity again when called with force', function () {
            var identityResponse = authenticationService.identity();
            httpBackend.flush();
            identityResponse.then(function () {
                // This will force another call to /users/me
                authenticationService.identity(true);
                httpBackend.flush();
            });
        });
    });
});