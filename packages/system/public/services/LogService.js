/*global printStackTrace:false */

'use strict';

/**
 * Log Angular exceptions to DB
 */

var app = angular.module('mean.system');

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
    // Actual error implementation. Extends original error to also log to database
    function error(exception, cause) {

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

    return (error);
}]);

/**
 * Application Logging Service to give us a way of logging
 * error / debug statements from the client to the server.
 */
app.factory('LogService', ['$log', '$window', 'TraceService', function ($log, $window, TraceService) {
    return ({
        // Manual call to error logging
        error: function (params) {
            // preserve default behaviour
            $log.error.apply($log, arguments);

            var dataObj = {
                url: $window.location.href,
                message: params.message,
                type: 'error'
            };
            // If called with stackTrace, use one
            if (typeof params.stackTrace !== 'undefined' && params.stackTrace) {
                // use our TraceService to generate a stack trace
                dataObj.stackTrace = TraceService.print().join('\n');
            }
            // send server side
            $.ajax({
                type: 'POST',
                url: '/logger',
                contentType: 'application/json',
                data: angular.toJson(dataObj)
            });
            // Debug function. Called with LogService.debug({message: '....', stackTrace: bool})
        }, debug: function (params) {
            $log.log.apply($log, arguments);
            var dataObj = {
                url: $window.location.href,
                message: params.message,
                type: 'debug'
            };
            // If called with stackTrace, use one
            if (typeof params.stackTrace !== 'undefined' && params.stackTrace) {
                // use our TraceService to generate a stack trace
                dataObj.stackTrace = TraceService.print().join('\n');
            }
            //
            $.ajax({
                type: 'POST',
                url: '/logger',
                contentType: 'application/json',
                data: angular.toJson(dataObj)
            });
        }
    });
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