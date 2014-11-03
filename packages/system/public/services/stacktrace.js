/*global printStackTrace, $:false */

'use strict';

var app = angular.module('mean.tasklist');

/**
 * Service that gives us a nice Angular-esque wrapper around the
 * stackTrace.js pintStackTrace() method.
 */
app.factory('TraceService', function () {
    return ({
        print: printStackTrace
    });
});

/**
 * Exception Logging Service, currently only used by the $exceptionHandler
 * it preserves the default behaviour ( logging to the console) but
 * also posts the error server side after generating a stacktrace.
 */
app.factory('exceptionLoggingService', ['$log', '$window', 'TraceService', 'Global', function ($log, $window, TraceService, Global) {
    function error(exception, cause) {

        console.log('in error');

        // preserve the default behaviour which will log the error
        // to the console, and allow the application to continue running.
        $log.error.apply($log, arguments);

        // now try to log the error to the server side.
        try {
            var errorMessage = exception.toString();

            // use our TraceService to generate a stack trace
            var stackTrace = TraceService.print({e: exception});

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
                    cause: ( cause || ''),
                    user: Global.user._id
                })
            });
        } catch (loggingError) {
            $log.warn('Error server-side logging failed');
            $log.log(loggingError);
        }
    }
    console.log('about to call error');

    return (error);
}]);


/**
 * Override Angular's built in exception handler, and tell it to
 * use our new exceptionLoggingService which is defined below
 */
app.provider('$exceptionHandler', {
    $get: function (exceptionLoggingService) {
        return (exceptionLoggingService);
    }
});