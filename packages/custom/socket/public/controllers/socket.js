'use strict';

angular.module('mean.socket').controller('SocketController', ['$scope', 'Global', 'Socket',
  function($scope, Global, Socket) {
    $scope.global = Global;
    $scope.package = {
      name: 'socket'
    };
  }
]);
