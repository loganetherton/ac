'use strict';

angular.module('mean.overview').controller('OverviewController',
['$scope', 'Global', 'Overview', function ($scope, Global, Overview) {
    $scope.global = Global;
    $scope.package = {
        name: 'overview'
    };

    $scope.easypiechart = {
        percent: 65,
        options: {
            animate: {
                duration: 1000,
                enabled: true
            },
            barColor: '#1C7EBB',
            lineCap: 'round',
            size: 180,
            lineWidth: 5
        }
    };
}]);
