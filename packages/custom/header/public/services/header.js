'use strict';

var app = angular.module('mean.header');

app.factory('Header', [
  function() {
    return {
      name: 'header'
    };
  }
]);

/**
 * Get all messages for this user
 */
app.factory('GetMessagesService', ['$http', function ($http) {
    return {
        // Get all messages for this user
        getMessages: function () {
            return $http.get('/user/getMessages');
        }
    };
}]);
