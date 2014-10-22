'use strict';

var app = angular.module('mean.articles');

app.filter('reverse', [function () {
    return function (text, where) {
        var newText,
            firstPart = '',
            secondPart = '',
            i;
        // Reverse only part of the word, and only if a number is passed in
        if (typeof where !== 'undefined' && (typeof where === 'number' && isFinite(where) && where % 1 === 0)) {
            newText = text.split('');
            for (i = 0; i < where; i = i + 1) {
                firstPart += newText[i];
            }
            for (i = where; i < text.length; i = i + 1) {
                secondPart += newText[i];
            }
            // Reverse only part of the string, then join it back together
            firstPart = firstPart.split('').reverse().join('');
            return firstPart + secondPart;
        } else {
            return text.split('').reverse().join('');
        }
    };
}]);