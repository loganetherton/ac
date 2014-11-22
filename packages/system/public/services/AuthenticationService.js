'use strict';

var app = angular.module('mean.system');

app.factory('AuthenticationService', ['$q', '$timeout', '$http', 'User', function ($q, $timeout, $http, User) {
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

            // for this demo, we'll store the identity in localStorage. For you, it could be a cookie, sessionStorage, whatever
            if (identity) {
                User.identity = identity;
            } else {
                User.identity = null;
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
    return {
        authorize: function () {
            // identity() will make a call to /users/me to get user
            return AuthenticationService.identity().then(function () {
                var isAuthenticated = AuthenticationService.isAuthenticated();

                if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 &&
                    !AuthenticationService.isInAnyRole($rootScope.toState.data.roles)) {
                    // user is signed in but not authorized for desired state
                    if (isAuthenticated) {
                        // Todo Make an access denied state
                        $state.go('auth.login');
                    } else {
                        // user is not authenticated. stow the state they wanted before you
                        // send them to the signin state, so you can return them when you're done
                        $rootScope.returnToState = $rootScope.toState;
                        $rootScope.returnToStateParams = $rootScope.toStateParams;

                        // now, send them to the signin state so they can log in
                        $state.go('auth.login');
                    }
                }
            });
        },
        /**
         * Force recheck of auth state
         *
         * @returns {*}
         */
        forceCheckAuthorize: function () {
            // identity() will make a call to /users/me to get user
            return AuthenticationService.identity(true).then(function () {
                var deferred = $q.defer();
                var isAuthenticated = AuthenticationService.isAuthenticated();
                deferred.resolve();

                if ($rootScope.toState.data.roles && $rootScope.toState.data.roles.length > 0 &&
                    !AuthenticationService.isInAnyRole($rootScope.toState.data.roles)) {
                    // user is signed in but not authorized for desired state
                    if (isAuthenticated) {
                        // Todo Make an access denied state
                        $state.go('auth.login');
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
            });
        },
        /**
         * Verify that the user is not authenticated before accessing auth states
         */
        checkAuthStateAccess: function () {
            return AuthenticationService.identity(true).then(function (data) {
                // If the user is logged in, kick them back to where they just were
                if (data) {
                    $state.go($rootScope.fromState.name);
                }
            });
        }
    };
}]);