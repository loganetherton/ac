'use strict';

var app = angular.module('mean.users');

app.factory('acLoginService', ['$http', '$q', 'User', '$rootScope', function ($http, $q, User, $rootScope) {
    return {
        login: function (user) {
            var deferred = $q.defer();
            return $http.post('/login', {
                email: user.email,
                password: user.password
            }).success(function (response) {
                deferred.resolve();
                // Pass in to User service to maintain state for tasks
                User.identity = response.user;
                $rootScope.$emit('loggedin', response);
                return deferred.promise;
            }).error(function () {
                return deferred.promise;
            });
        }
    };
}]);