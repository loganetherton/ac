'use strict';

var app = angular.module('mean.teams');

app.directive('sendMessage', [function () {
    return {
        templateUrl: 'teams/views/directiveTemplates/viewTeam.html',
        controller: function ($scope) {
            var vm = this;

            vm.content = '';
        },
        controllerAs: 'messageCtrl'
    };
}]);