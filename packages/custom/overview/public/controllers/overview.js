'use strict';

angular.module('mean.overview').controller('OverviewController',
['$scope', 'Global', 'Overview', '$http', 'TasklistService', function ($scope, Global, Overview, $http, TasklistService) {
    var vm = this;

    vm.data = 'hello';

    //$http.get('d3Data/flare.json').then(function (data) {
    //    $scope.$broadcast('graphData', data.data);
    //});
    //
    //TasklistService.getTasksForGraph().then(function (data) {
    //    //console.log(data);
    //});

    //setTimeout(function () {
    //    $scope.$broadcast('graphData');
    //}, 1000);
}]);
