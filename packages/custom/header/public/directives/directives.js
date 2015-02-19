/*global Bloodhound:false */
'use strict';

var app = angular.module('mean.header');

app.directive('userDropdown', [function () {
    return {
        templateUrl: 'header/views/directiveTemplates/userDropdown.html',
        restrict: 'E',
        controller: 'HeaderController',
        controllerAs: 'headerCtrl',
        link: function (scope, element, attrs, controller) {

        }
    };
}]);

/**
 * Drop down for adding users to the team
 */
app.directive('addToTeam', [function () {
    return {
        templateUrl: 'header/views/directiveTemplates/addToTeam.html',
        replace: true,
        controller: function () {
            var vm = this;
            vm.selectedUser = null;

            // Instantiate bloodhound
            var bloodhound = new Bloodhound({
                datumTokenizer: function (d) {
                    return Bloodhound.tokenizers.whitespace(d.name);
                },
                queryTokenizer: Bloodhound.tokenizers.whitespace,
                // Query from /searchUsers
                remote: '/users/search/%QUERY'
            });

            // initialize the bloodhound suggestion engine
            bloodhound.initialize();

            vm.existingUsers = {
                displayKey: 'name',
                source: bloodhound.ttAdapter()
            };

            // Typeahead options object
            vm.exampleOptions = {
                highlight: true
            };
        },
        controllerAs: 'addToTeamCtrl',
        link: function (scope, element, attrs, controller) {
            var search = true;
            var isValidSelection = function (val) {
                return _.isObject(val) && _.has(val, '_id') && _.has(val, 'email') && _.has(val, 'name');
            };
            // Don't close on click
            element.find('.list-group, .panel-footer').bind('click', function (e) {
                e.preventDefault();
                e.stopPropagation();
            });
            // When a valid user is selected, change the text to send. If a valid user is lost, replace with instructions
            scope.$watch(function () {
                return controller.selectedUser;
            }, function (newVal) {
                // Valid selection
                if (search) {
                    if (isValidSelection(newVal)) {
                        search = false;
                        $(element).find('#searchUser').replaceWith('<button class="btn btn-info" id="searchUser">Send invite</button>');
                    }
                    // Valid selection lost
                } else if (!isValidSelection(newVal)) {
                    $(element).find('#searchUser').replaceWith('<a id="searchUser">Search for an existing user by name or email</a>');
                    search = true;
                }
            });
        }
    };
}]);

/**
 * Search for existing users so they can be invited to the team
 */
app.directive('searchExistingUser', [function () {
    return {
        template: '<div>' +
                        '<input class="typeahead" type="text" sf-typeahead options="addToTeamCtrl.exampleOptions" ' +
                            'datasets="addToTeamCtrl.existingUsers"' +
                            'ng-model="addToTeamCtrl.selectedUser">' +
                  '</div>',
        replace: true,
        require: '^addToTeam',
        controllerAs: 'addToTeamCtrl',
        link: function (scope, element, attrs, controller) {

        }
    };
}]);