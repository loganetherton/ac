/*global Pace:false */
(function () {
    'use strict';
    // To avoid displaying unneccesary social logins
    var clientIdProperty = 'clientID',
    defaultPrefix = 'DEFAULT_';

    var AuthCtrl = function ($scope, $rootScope, $http, $location, Global, AuthorizationService, $state) {
        // This object will contain list of available social buttons to authorize
        $scope.socialButtons = {
            facebook: true, twitter: true, google: true
        };
        $scope.socialButtonsCounter = 0;
        $scope.global = Global;
        $http.get('/get-config').success(function (config) {
            for (var conf in config) {
                // Do not show auth providers that have the value DEFAULT as their clientID
                if (config[conf].hasOwnProperty(clientIdProperty) &&
                    config[conf][clientIdProperty].indexOf(defaultPrefix) === -1) {
                    $scope.socialButtons[conf] = true;
                    $scope.socialButtonsCounter += 1;
                }
            }
        });

        /**
         * Make sure authorization is updated after login, then redirect
         */
        $rootScope.$on('loggedin', function (emit, response) {
            AuthorizationService.forceCheckAuthorize().then(function () {
                if (typeof response !== 'undefined' && response.hasOwnProperty('redirect') && response.redirect) {
                    $state.go(response.redirect);
                } else {
                    $state.go('site.tasklist');
                }
                // Todo Debug why Pace never completed on login
                // This is a temporary fix -- 11/20/14
                if (typeof Pace === 'object' && typeof Pace.restart === 'function') {
                    Pace.restart();
                }
            });
        });
    };

    /**
     * Handle state for login form, as well as login requests
     */
    var LoginCtrl = function ($scope, $rootScope, Global, acLoginService) {
        var vm = this;
        // This object will be filled by the form
        $scope.user = {};
        $scope.global = Global;
        $scope.global.registerForm = false;
        $scope.passwordInput = {
            type: 'password',
            placeholder: 'Password',
            iconClass: '',
            tooltipText: 'Show password'
        };

        /**
         * Login to the application
         */
        vm.login = function () {
            acLoginService.login($scope.user).then(function () {
                vm.loginError = 0;
            }, function () {
                vm.loginerror = 'Authentication failed.';
            });
        };
    };

    /**
     * Handle state and register function
     */
    var RegisterCtrl = function($scope, $rootScope, $http, Global, acRegisterService) {
        var vm = this;
        $scope.user = {};
        $scope.global = Global;
        $scope.global.registerForm = true;
        // Password and confirm password input boxes
        $scope.passwordInput = {
            type: 'password',
            placeholder: 'Password',
            placeholderConfirmPass: 'Repeat Password',
            iconClass: '',
            tooltipText: 'Show password'
        };

        /**
         * Handle registration
         */
        vm.register = function () {
            $scope.registerError = null;
            acRegisterService.register($scope.user).then(function () {
                vm.registerError = 0;
            }, function (error) {
                // Error: authentication failed
                if (error === 'Email already taken') {
                    vm.emailError = error;
                } else {
                    vm.registerError = error;
                }
            });
        };
    };

    var ForgotPasswordCtrl = function($scope, $rootScope, $http, $location, Global) {
        $scope.user = {};
        $scope.global = Global;
        $scope.global.registerForm = false;
        $scope.forgotpassword = function() {
            $http.post('/forgot-password', {
                text: $scope.text
            })
            .success(function(response) {
                $scope.response = response;
            })
            .error(function(error) {
                $scope.response = error;
            });
        };
    };

    var ResetPasswordCtrl = function($scope, $rootScope, $http, $location, $stateParams, Global) {
        $scope.user = {};
        $scope.global = Global;
        $scope.global.registerForm = false;
        $scope.resetpassword = function() {
            $http.post('/reset/' + $stateParams.tokenId, {
                password: $scope.user.password,
                confirmPassword: $scope.user.confirmPassword
            })
            .success(function(response) {
                $rootScope.user = response.user;
                $rootScope.$emit('loggedin');
                if (response.redirect) {
                    if (window.location.href === response.redirect) {
                        //This is so an admin user will get full admin page
                        window.location.reload();
                    } else {
                        window.location = response.redirect;
                    }
                } else {
                    $location.url('/');
                }
            })
            .error(function(error) {
                if (error.msg === 'Token invalid or expired')
                    $scope.resetpassworderror = 'Could not update password as token is invalid or may have expired';
                else
                    $scope.validationError = error;
            });
        };
    };

angular.module('mean.users')
.controller('AuthCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global', 'AuthorizationService', '$state', AuthCtrl])
.controller('LoginCtrl', ['$scope', '$rootScope', 'Global', 'acLoginService', LoginCtrl])
.controller('RegisterCtrl', ['$scope', '$rootScope', '$http', 'Global', 'acRegisterService', RegisterCtrl])
.controller('ForgotPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', 'Global', ForgotPasswordCtrl])
.controller('ResetPasswordCtrl', ['$scope', '$rootScope', '$http', '$location', '$stateParams', 'Global', ResetPasswordCtrl]);
})();