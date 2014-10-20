'use strict';

var app = angular.module('mean.articles');

//Articles service used for articles REST endpoint
app.factory('Articles', ['$resource',
  function($resource) {
    return $resource('articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

// Testing
app.factory('Data', [function () {
    return {
        message: "I'm data from a service"
    }
}]);

app.filter('reverse', [function () {
    return function (text) {
        return text.split("").reverse().join("");
    }
}]);