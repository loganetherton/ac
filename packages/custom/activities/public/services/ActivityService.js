'use strict';

var app = angular.module('mean.system');

app.factory('ActivityService', ['$http', '$log', function ($http, $log) {
    function getActivities(callback){

        // Get initial activities data
        $http.get('activities/activity.json').success(function(data){
            callback(data);
        }).error(function(){
            $log.log('Error');
            callback([]);
        });
    }

    function getActivitiesByType(type, callback){
        $http.get('api/activities/activity-' + type + '.json').success(function(data){
            callback(data);
        }).error(function(){
            $log.log('Error');
            callback([]);
        });
    }

    return{
        get:function(callback){
            getActivities(callback);
        },
        getbytype:function(type,callback){
            getActivitiesByType(type, callback);
        }
    };
}]);