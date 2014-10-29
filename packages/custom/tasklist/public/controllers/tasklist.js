'use strict';

angular.module('mean.tasklist').controller('TasklistController',
['$scope', '$stateParams', '$location', 'Global', 'Tasklist', function ($scope, $stateParams, $location, Global, Tasklist) {
    $scope.global = Global;
    $scope.strings = {
        name: 'Task list',
        project: 'Setting up'
    };
    /**
     * Create a new article
     * @param isValid
     */
    $scope.create = function (isValid) {
        if (isValid) {
            var task  = new Tasklist({
                title: this.title,
                content: this.content
            });
            task.$save(function (response) {
                $location.path('tasklist/' + response._id);
            });

            this.title = '';
            this.content = '';
        } else {
            $scope.submitted = true;
        }
    };
}]);
