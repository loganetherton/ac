/*global printStackTrace, $:false */

'use strict';

var app = angular.module('mean.tasklist');

app.factory('traceService', [function () {
    return {
        // I think I might need to include it via npm, so it works on the backend
        print: printStackTrace
    };
}]);

app.provider('$exceptionHandler', [function () {
    return {
        $get: function (exceptionLoggingService) {
            return exceptionLoggingService;
        }
    };
}]);

app.factory('exceptionLoggingService', ['$log', '$window', 'traceService', function ($log, $window, traceService) {
    function error(exception, cause){

        // preserve the default behaviour which will log the error
        // to the console, and allow the application to continue running.
        $log.error.apply($log, arguments);

        // now try to log the error to the server side.
        try{
            var errorMessage = exception.toString();

            // use our traceService to generate a stack trace
            var stackTrace = traceService.print({e: exception});

            // use AJAX (in this example jQuery) and NOT
            // an angular service such as $http
            $.ajax({
                type: 'POST',
                url: '/logger',
                contentType: 'application/json',
                data: angular.toJson({
                    url: $window.location.href,
                    message: errorMessage,
                    type: 'exception',
                    stackTrace: stackTrace,
                    cause: ( cause || '')
                })
            });
        } catch (loggingError){
            $log.warn('Error server-side logging failed');
            $log.log(loggingError);
        }
    }
    return(error);
}]);