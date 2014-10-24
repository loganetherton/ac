'use strict';
var app = angular.module('mean.system');

app.controller('SystemTestCtrl', ['$scope',  function ($scope) {

    $scope.loadMoreTweets = function () {
        console.log('loading tweets');
    };

    $scope.deleteTweets = function () {
        console.log('deleting tweets');
    };
}]);