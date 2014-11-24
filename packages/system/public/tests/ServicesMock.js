/**
 * Mocking global strings
 * @returns {{data: {user: string, authenticated: boolean, isAdmin: boolean}, tasklist: {strings: {name: string, project: string}}}}
 * @constructor
 */
var GlobalMock = function () {
    return {
        data: {
            user: 'logan',
            authenticated: true,
            isAdmin: true
        },
        tasklist: {
            strings: {
                name: 'Mock Task list',
                project: 'Mock Setting up'
            }
        }
    };
};

/**
 * Mock the authenticationService
 */
var AuthenticationServiceMock = function ($http, SocketService, Global, LogService, $q, User, $rootScope) {
    var _identity = {
            _id: 1,
            roles: ['authenticated']
        },
        _authenticated = true,
        _inAnyRole = true;

    return {
        // Helper function to just make the user unauthenticated
        setUnauthenticated: function () {
            _identity = false;
            _authenticated = false;
            _inAnyRole = false;
        },
        isIdentityResolved: function () {
            return _identity;
        },
        isAuthenticated: function () {
            return _authenticated;
        },
        isInRole: function (role) {
            if (!_authenticated || !_identity.roles) {
                return false;
            }
            return _identity.roles.indexOf(role) !== -1;
        },
        isInAnyRole: function (roles) {
            if (!_authenticated || !_identity.roles) {
                return false;
            }
            for (var i = 0; i < roles.length; i = i + 1) {
                if (this.isInRole(roles[i])) {
                    return true;
                }
            }
            return false;
        },
        authenticate: function (identity) {
            _identity = identity;
            _authenticated = !!identity;

            if (identity) {
                User.identity = identity;
            } else {
                User.identity = null;
            }
        },
        identity: function (force) {
            var deferred = $q.defer();
            if (force === true) {
                _identity = undefined;
            }

            if (angular.isDefined(_identity)) {
                $rootScope.$apply(deferred.resolve(_identity));
                return deferred.promise;
            }

            $rootScope.$apply(deferred.resolve({
                _id: 1,
                name: 'a really bool dude',
                roles: ['authenticated']
            }));

            return deferred.promise;
        }
    };
};