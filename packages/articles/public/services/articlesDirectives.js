'use strict';

var app = angular.module('mean.articles');

angular.module('mean.articles').directive('displayListItem', function () {
    return {
        templateUrl: 'articles/views/titleListing.html'
    };
    // Retrieve a blank item
});

angular.module('mean.articles').directive('blankItem', function ($compile) {
    return {
        templateUrl: 'articles/views/blankItem.html',
        restrict: 'AEC',
        scope: true,
        link: function(scope, element, attribute){
            var clickFunction = function(){
                // This is going to call replaceWithInput() in the controller below
                scope.$eval(attribute.blankItem);
                scope.$apply();
                element.unbind('click', clickFunction);
            };

            element.bind('click', clickFunction);
        },
        controller: function($scope, $element){
            $scope.replaceWithInput = function(){
                $scope.testA = 'Write some shit';
                var html ='<input type="text" class="col-md-12" style="height: 25px" ng-model="testA">';
                var e = $compile(html)($scope);
                $element.html(e);
                $scope.$watch('testA', function(oldVal, newVal){
                    console.log('watcher inside directive');
                });
            };
        }
    };
    // When you click a blank item, it gives you something to input an item in
});

angular.module('mean.articles').directive('coolDrink', function() {
    return {
        scope: {
            isolatedBindingFoo: '=',
            isolatedAttributeFoo: '@',
            isolatedExpressionFoo:'&'
        },
        template: '<h2>Isolated Binding</h2>' +
                  '<div>{{isolatedBindingFoo}}</div>' +
                  '<input ng-model="isolatedBindingFoo"><br>' +
                  '<h2>Isolated Attribute</h2>' +
                  '<div>{{isolatedAttributeFoo}}</div>' +
                  '<input ng-model="isolatedAttributeFoo">' +
                  '<h2>Isolated Expression</h2>' +
                  '<input ng-model="isolatedFoo">' +
                  '<button class="btn" ng-click="isolatedExpressionFoo({newFoo:isolatedFoo})">Submit</button>'
    };
});

angular.module('mean.articles').directive('removeBar', function(){
    return {
        template: '',
        link: function(scope, element, attribute) {

        }
    };
});

angular.module('mean.articles').directive('focusIf', [function () {
    return function focusIf(scope, element, attr) {
        scope.$watch(attr.focusIf, function (newVal) {
            if (newVal) {
                scope.$evalAsync(function() {
                    element[0].focus();
                });
            }
        });
    };
}]);

// If you click other than on the input element, replace it with the blank area
app.directive('clickAnywhereButHere', function($document){
    return {
        restrict: 'A',
        link: function(scope, elem, attr, ctrl) {
            elem.bind('click', function(e) {
                // this part keeps it from firing the click on the document.
                e.stopPropagation();
            });
            $document.bind('click', function() {
                // magic here.
                scope.$apply(attr.clickAnywhereButHere);
            });
        }
    };
});

app.directive('svgCircle', function() {
    return {
        restrict: 'E',
        scope: {
            size: '@',
            stroke: '@',
            fill: '@'
        },
        replace: true,
        template: '<svg ng-attr-height="{{values.canvas}}" ng-attr-width="{{values.canvas}}" class="gray">' +
                  '<circle ng-attr-cx="{{values.center}}" ng-attr-cy="{{values.center}}"' +
                  'ng-attr-r="{{values.radius}}" stroke="{{stroke}}"' +
                  'stroke-width="3" fill="{{fill}}" />' +
                  '</svg>',
        link: function(scope, element, attr) {
            var calculateValues = function(size) {
                var canvasSize = size * 2.5;

                scope.values = {
                    canvas: canvasSize,
                    radius: size,
                    center: canvasSize / 2
                };
            };

            //var size = parseInt(attr.size, 0);

            attr.$observe('size', function(newSize) {
                calculateValues(parseInt(newSize, 0));
            });
        }
    };
});