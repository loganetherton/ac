'use strict';

(function () {
    // Login Controller Spec
    describe('LoginCtrl', function () {
        beforeEach(function () {
            this.addMatchers({
                toEqualData: function (expected) {
                    return angular.equals(this.actual, expected);
                }
            });
        });

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.users');
        });

        var LoginCtrl, scope, $rootScope, $httpBackend, $location;

        beforeEach(inject(function ($controller, _$rootScope_, _$location_, _$httpBackend_) {

            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;

            LoginCtrl = $controller('LoginCtrl', {
                $scope: scope, $rootScope: _$rootScope_
            });

            $httpBackend = _$httpBackend_;

            $location = _$location_;

        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should login with a correct user and password', function () {

            spyOn($rootScope, '$emit');
            // test expected GET request
            $httpBackend.when('POST', '/login').respond(200, {
                user: 'Fred'
            });
            LoginCtrl.login();
            $httpBackend.flush();
            // test scope value
            //expect($rootScope.user).toEqual('Fred');
            expect($rootScope.$emit).toHaveBeenCalledWith('loggedin', { user : 'Fred' });
            expect($location.url()).toEqual('/tasklist');
        });

        it('should fail to log in ', function () {
            $httpBackend.expectPOST('/login').respond(400, 'Authentication failed');
            LoginCtrl.login();
            $httpBackend.flush();
            // test scope value
            expect(LoginCtrl.loginerror).toEqual('Authentication failed.');

        });
    });

    describe('RegisterCtrl', function () {
        beforeEach(function () {
            this.addMatchers({
                toEqualData: function (expected) {
                    return angular.equals(this.actual, expected);
                }
            });
        });

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.users');
        });

        var RegisterCtrl, scope, $rootScope, $httpBackend, $location;

        beforeEach(inject(function ($controller, _$rootScope_, _$location_, _$httpBackend_) {

            scope = _$rootScope_.$new();
            $rootScope = _$rootScope_;

            RegisterCtrl = $controller('RegisterCtrl', {
                $scope: scope, $rootScope: _$rootScope_
            });

            $httpBackend = _$httpBackend_;

            $location = _$location_;

        }));

        afterEach(function () {
            $httpBackend.verifyNoOutstandingExpectation();
            $httpBackend.verifyNoOutstandingRequest();
        });

        it('should register with correct data', function () {
            spyOn($rootScope, '$emit');
            // test expected GET request
            scope.user.name = 'Fred';
            $httpBackend.when('POST', '/register').respond(200, 'Fred');
            RegisterCtrl.register();
            $httpBackend.flush();
            // test scope value
            expect(RegisterCtrl.registerError).toEqual(0);
            expect($rootScope.$emit).toHaveBeenCalledWith('loggedin', 'Fred');
            expect($location.url()).toBe('/tasklist');
        });

        it('should fail to register with non-matching passwords', function () {
            $httpBackend.when('POST', '/register').respond(400, 'Password mismatch');
            RegisterCtrl.register();
            $httpBackend.flush();
            // test scope value
            expect(RegisterCtrl.registerError.data).toBe('Password mismatch');
        });
    });
}());
