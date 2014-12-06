'use strict';

var app = angular.module('mean.recentprojects');

app.factory('RecentTasksService', ['$http', '$q', function ($http, $q) {
    return {
        // Load tasks by page
        loadTasks: function (page) {
            var deferred = $q.defer();
            $http.get('/recentTasks/' + page).then(function (data) {
                deferred.resolve(data.data);
            }, function (err) {
                deferred.reject(err);
            });
            return deferred.promise;
        }
    };
}]);