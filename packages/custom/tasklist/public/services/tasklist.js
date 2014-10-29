'use strict';

var app = angular.module('mean.tasklist');

//Articles service used for articles REST endpoint
app.factory('Tasklist', ['$resource', function ($resource) {
    return $resource('tasklist/:articleId', {
        articleId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);
