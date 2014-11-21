(function () {
    'use strict';

    var app = angular.module('mean.users');

    app.factory('acRegisterService', ['$rootScope', '$http', '$q', 'User', function ($rootScope, $http, $q, User) {
        return {
            register: function (user) {
                var deferred = $q.defer();
                return $http.post('/register', {
                    email: user.email,
                    password: user.password,
                    confirmPassword: user.confirmPassword,
                    name: user.name
                    // authentication OK
                }).success(function (data) {
                    deferred.resolve(data);
                    // Emit logged in for handling in authCtrl
                    $rootScope.$emit('loggedin', data);
                    return deferred.promise;
                    // Return error in deferred
                }).error(function (error) {
                    deferred.reject(error);
                    return deferred.promise;
                });
            }
        };
    }]);
})();
