'use strict';

var app = angular.module('mean.system');

app.factory('acSessionService', ['$http', function ($http) {
    return {
        // Write the team to session if the user has been invited to a team
        writeTeamToSession: function (teamId) {
            return $http.post('/writeTeamToSession', {
                teamId: teamId
            });
        }
    };
}]);