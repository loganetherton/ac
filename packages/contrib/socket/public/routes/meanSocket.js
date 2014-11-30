'use strict';

angular.module('mean.socket').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('example_socket', {
            url: '/meansocket/help',
            templateUrl: 'socket/views/index.html'
        });
    }
]);
