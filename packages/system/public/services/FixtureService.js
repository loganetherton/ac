var app = angular.module('mean.system');

app.factory('FixtureService', ['$http', '$q', function ($http, $q) {
    return {
        clearUsers: function () {
            var deferred = $q.defer();
            $http.post('/clearUsers', {}).then(function (response) {
                deferred.resolve(response.data);
                //return response.data;
            }, function (error) {
                deferred.reject({
                    data: {
                        error: 'Could not resolve $http request to /tasklist'
                    }
                });
            });
            return deferred.promise;
        }
    };
}]);
