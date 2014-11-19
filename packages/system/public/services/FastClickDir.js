/*global FastClick:false */
'use strict';

var app = angular.module('mean.system');

app.directive('fastClick', [function () {
    return {
        restrict: 'A',
        compile: function (tElement, tAttributes) {
            tElement.removeAttr('smart-fast-click data-smart-fast-click');

            FastClick.attach(tElement);

            if (!FastClick.notNeeded()) {
                tElement.addClass('needsclick');
            }
        }
    };
}]);
