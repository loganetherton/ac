'use strict';

var app = angular.module('mean.tasklist');

//Articles service used for articles REST endpoint
app.factory('Tasklist', ['$resource', function ($resource) {
    return $resource('tasklist/:articleId', {
        articleId: '@_id'
    }, {
        update: {
            method: 'PUT'
        }
    });
}]);

/**
 * Create stack trace
 */
app.factory('Stacktrace', [function () {
    return {
        trace: function(){
            var e = new Error('dummy');
            var stack = e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@')
            .split('\n');
            console.log(stack);
        }
    }
}]);