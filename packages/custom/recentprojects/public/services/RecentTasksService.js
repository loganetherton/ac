'use strict';

var app = angular.module('mean.recentprojects');

app.factory('RecentTasksService', ['$http', function ($http) {
    return {
        // Load tasks by page
        loadTasks: function (page) {
            return $http.get('/recentTasks/' + page);
        }
    };
}]);