'use strict';

var app = angular.module('mean.recentprojects');

app.factory('ProjectService', ['$http', function ($http) {
    return {
        // Load the first page of tasks
        list: function () {
            return $http.get('/recentTasks');
        },
        // Load additional tasks
        loadMore: function (page) {
            return $http.get('/recentTasks/' + page);
        }
    };
}]);