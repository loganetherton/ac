'use strict';

var app = angular.module('mean.system');

app.factory('AuthenticationService',
['$q', '$timeout', '$http', 'User', '$rootScope', function ($q, $timeout, $http, User, $rootScope) {
    var _identity,
    _authenticated = false;

    return {
        // Check whether the identity has currently been resolved
        isIdentityResolved: function() {
            return angular.isDefined(_identity);
        },
        // Hold access to whether the user has already been authenticated
        isAuthenticated: function() {
            return _authenticated;
        },
        // Whether the user has the requested role
        isInRole: function(role) {
            if (!_authenticated || !_identity.roles) {
                return false;
            }

            return _identity.roles.indexOf(role) !== -1;
        },
        /**
         * Check whether the user has a role that is required by the requested state
         */
        isInAnyRole: function(roles) {
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
        /**
         * Authenticate and hold access to the user's identity
         *
         * @param identity
         */
        authenticate: function(identity) {
            _identity = identity;
            _authenticated = !!identity;
            // Store on the user object (persists in session)
            if (identity) {
                User.setIdentity(identity);
            } else {
                User.setIdentity(null);
            }
        },
        /**
         * Retrieve the user's identity
         *
         * @param force
         * @returns {*}
         */
        identity: function(force) {
            var deferred = $q.defer();

            if (force === true) {
                _identity = undefined;
            }

            // check and see if we have retrieved the identity data from the server. if we have, reuse it by immediately resolving
            if (angular.isDefined(_identity)) {
                deferred.resolve(_identity);

                return deferred.promise;
            }

            var self = this;
            // otherwise, retrieve the identity data from the server, update the identity object, and then resolve.
            $http.get('/users/me', {ignoreErrors: true}).success(function (data) {
                self.authenticate(data);
                deferred.resolve(data);
            }).error(function () {
                //_identity = null;
                //_authenticated = false;
                self.authenticate();
                deferred.resolve(_identity);
            });

            return deferred.promise;
        }
    };
}]);

app.factory('AuthorizationService', ['$rootScope', '$state', 'AuthenticationService', '$q',
function ($rootScope, $state, AuthenticationService, $q) {
    /**
     * Perform the actual auth check after identity retrieval
     * @param identity
     * @returns {*}
     */
    var checkAuth = function (identity) {
        var deferred = $q.defer();
        var isAuthenticated = AuthenticationService.isAuthenticated();
        deferred.resolve(identity);
        if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 &&
            !AuthenticationService.isInAnyRole($rootScope.toState.data.roles)) {
            // user is signed in but not authorized for desired state
            if (isAuthenticated) {
                // Todo Make an access denied state
                console.log('access denied');
                //$state.go('accessDenied');
            } else {
                // user is not authenticated. stow the state they wanted before you
                // send them to the signin state, so you can return them when you're done
                $rootScope.returnToState = $rootScope.toState;
                $rootScope.returnToStateParams = $rootScope.toStateParams;

                // now, send them to the signin state so they can log in
                $state.go('auth.login');
            }
        }
        return deferred.promise;
    };

    return {
        authorize: function () {
            // identity() will make a call to /users/me to get user
            return AuthenticationService.identity().then(function (identity) {
                return checkAuth(identity);
            });
        },
        /**
         * Force recheck of auth state
         *
         * @returns {*}
         */
        forceCheckAuthorize: function () {
            // identity() will make a call to /users/me to get user
            return AuthenticationService.identity(true).then(function (identity) {
                return checkAuth(identity);
            });
        },
        /**
         * Verify that the user is not authenticated before accessing auth states
         */
        checkAuthStateAccess: function () {
            return AuthenticationService.identity(true).then(function (data) {
                // If the user is logged in, kick them back to where they just were
                if (data) {
                    if ('fromState' in $rootScope && 'name' in $rootScope.fromState && $rootScope.fromState.name) {
                        console.log('checking auth state access');
                        $state.go($rootScope.fromState.name);
                    } else {
                        $state.go('site.tasklist');
                    }
                }
            });
        }
    };
}]);