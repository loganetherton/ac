'use strict';

angular.module('mean.socket').config(['$stateProvider',
    function($stateProvider) {
        $stateProvider.state('Mean socket help page', {
            url: '/meansocket/help',
            templateUrl: 'socket/views/index.html'
        });
    }
]);
