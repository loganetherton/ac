'use strict';

var app = angular.module('mean.recentprojects');

app.factory('ProjectService', ['$http', function ($http) {
    return {
        list: $http.get('/projects/projects.json')
    };
}]);