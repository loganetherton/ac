'use strict';

var app = angular.module('mean.recentprojects');

app.directive('recentProjects', [function () {
    return {
        restrict: 'EA',
        templateUrl: 'recentprojects/views/recent-projects.html',
        controller: 'RecentprojectsController',
        controllerAs: 'recentProjectsCtrl',
        scope: {

        },
        link: function(scope, element, attrs){
            var closed = true;
            scope.recentProjectsCtrl.page = 1;
            // On open, make sure the list is up to date
            element.on('click', function () {
                // Change page
                element.find('.nextPage, .prevPage').on('click', function (e) {
                    // Stop the tasklist from closing on click
                    e.preventDefault();
                    e.stopPropagation();
                    var elemClass = this.getAttribute('class');
                    // Go back a page
                    if (elemClass === 'prevPage') {
                        scope.recentProjectsCtrl.loadTasks('prev');
                    // Go forward a page
                    } else if (elemClass === 'nextPage') {
                        scope.recentProjectsCtrl.loadTasks('next');
                    }
                });
                // Recheck the first page to get any updates to that
                if (closed && scope.recentProjectsCtrl.page === 1) {
                    scope.recentProjectsCtrl.loadTasks();
                }
                closed = !closed;
            });
        }
    };
}]);