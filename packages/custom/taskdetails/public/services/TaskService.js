'use strict';

var app = angular.module('mean.taskdetails');

app.factory('TaskService', ['$http', '$q', function ($http, $q) {
    return {
        //checkValidId: function (id) {
        //    $http.post('/checkValidObjectId', {id: id}).then(function (response) {
        //        if (response.status !== 200) {
        //            $state.go('site.tasklist');
        //        }
        //    });
        //}
        /**
         * Retrieve a single task
         * @param id
         * @returns {*}
         */
        getTask: function (id) {
            var deferred = $q.defer();
            $http.get('/task/' + id).then(function (response) {
                if (response.status === 200) {
                    deferred.resolve(response.data);
                }
                deferred.reject();
            });
            return deferred.promise;
        }
    };
}]);
