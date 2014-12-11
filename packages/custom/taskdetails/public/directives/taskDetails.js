'use strict';

var app = angular.module('mean.taskdetails');

app.directive('taskDetails', [function () {
    return {
        templateUrl: 'taskdetails/views/directiveTemplates/task-details.html',
        scope: {
            task: '=',
            clickToEdit: '&'
        },
        link: function (scope, element) {
            //element.find('.change-to-input').on('click', function () {
            //    console.log(this);
            //});
        }
    };
}]);