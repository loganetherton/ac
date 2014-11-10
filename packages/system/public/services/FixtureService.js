'use strict';

var app = angular.module('mean.system');

app.factory('FixtureService', ['$http', '$q', function ($http, $q) {
    return {
        /**
         * Reset the users collection
         * @returns {*}
         */
        clearUsers: function () {
            var deferred = $q.defer();
            $http.post('/clearUsers', {}).then(function (response) {
                deferred.resolve(response.data);
                //return response.data;
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not resolve $http request to /clearUsers'
                    }
                });
            });
            return deferred.promise;
        },
        /**
         * Reset the tasks collection
         * @returns {*}
         */
        clearTasks: function () {
            var deferred = $q.defer();
            $http.post('/clearTasks', {}).then(function (response) {
                deferred.resolve(response.data);
                //return response.data;
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not resolve $http request to /clearTasks'
                    }
                });
            });
            return deferred.promise;
        }
    };
}]);
