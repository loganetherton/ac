'use strict';

var app = angular.module('mean.system');

app.factory('AuthenticationService', ['$q', '$timeout', '$http', 'User', function ($q, $timeout, $http, User) {
    var _identity,
    _authenticated = false;

    return {
        ////Check whether the user is authenticated
        //isAuthenticated: function () {
        //    // Initialize a new promise
        //    var deferred = $q.defer();
        //    // Make an AJAX call to check if the user is logged in
        //    $http.get('/loggedin').success(function (user) {
        //        // Authenticated
        //        if (user !== '0') {
        //            $timeout(deferred.resolve);
        //        }
        //        // Not Authenticated
        //        else {
        //            $timeout(deferred.reject);
        //        }
        //    });
        //    return deferred.promise;
        //}
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

            return _identity.roles.indexOf(role) != -1;
        },
        // Check whether the user has been assigned any role at all
        isInAnyRole: function(roles) {
            if (!_authenticated || !_identity.roles) {
                return false;
            }

            for (var i = 0; i < roles.length; i++) {
                if (this.isInRole(roles[i])) {
                    return true;
                }
            }

            return false;
        },
        /**
         * Authenticate and hold access to the user's identity
         *
         * TODO Change storage mechanism
         *
         * @param identity
         */
        authenticate: function(identity) {
            _identity = identity;
            _authenticated = identity != null;

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
         * Todo Change storage mechanism
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
                //_identity = data;
                //_authenticated = true;
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

app.factory('AuthorizationService', ['$rootScope', '$state', 'AuthenticationService',
function ($rootScope, $state, AuthenticationService) {
    return {
        authorize: function () {
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
            }, function () {
                console.log('not logged in');
            });
        },
        recheckAuthorization: function () {
            return AuthenticationService.identity(true).then(function () {
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
            }, function () {
                console.log('not logged in');
            });
        }
    };
}]);