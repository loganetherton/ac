'use strict';
var app = angular.module('mean.system');

app.directive('superman', [function () {
    return {
        restrict: 'E',
        template: '<div>Here I am to save the day!</div>'
    };
}]);

app.directive('enter', [function () {
    return function(scope, element, attrs){
        element.bind('mouseenter', function(){
            element.addClass(attrs.enter);
        });
    };
}]);

app.directive('leave', [function () {
    return function(scope, element, attrs){
        element.bind('mouseleave', function(){
            element.removeClass(attrs.enter);
        });
    };
}]);

app.directive('addtweet', [function () {
    return function(scope, element, attrs){
        element.bind('click', function(){
            scope.$apply(attrs.addtweet);
        });
    };
}]);



app.directive('superhero', [function () {
    return {
        restrict: 'A',
        scope: {},
        controller: 'SuperheroDirController',
        link: function (scope, element) {
            element.bind('click', function () {
                console.log(scope.abilities);
            });
        }
    };
}]);

app.directive('speed', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, SuperheroDirController) {
            SuperheroDirController.addSpeed();
        }
    };
}]);

app.directive('strength', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, superheroCtrl) {
            superheroCtrl.addStrength();
        }
    };
}]);

app.directive('flight', [function () {
    return {
        require: 'superhero',
        link: function (scope, element, attrs, superheroCtrl) {
            superheroCtrl.addFlight();
        }
    };
}]);

app.directive('kid', [function () {
    return {
        restrict: 'E',
        scope: {
            done: '&'
        },
        controller: 'KidController',
        // Done is mapped to whatever is passed in to done attribute
        template: '<input type="text" ng-model="chore"><p>{{chore}}</p>' +
                  '<button ng-click="done({task:chore})">I\'m done</button>'
    };
}]);

// @ reads in an attribute. This is convenient if you don't want to set up individual properties for the attributes,
// so you can just pass them in from the element
app.directive('drink', [function () {
    return {
        scope: {
            flavor: '@'
        },
        template: '<div>{{flavor}}</div>'
        // Don't need the linking function, since we're using @ to read the attributes of the element
        //link: function (scope, element, attrs) {
        //    scope.flavor = attrs.flavor;
        //}
    };
}]);

// = sends updates from the controller to the directive, and vice versa
// This does not use double curly braces to evaluate. You're sending in the property on the scope to bind to
// So here, the model flavor is bound to ctrlFlavor in the html, which is bound to ctrlFlavor in the controller
// Whenever any of them change, they all change
app.directive('drinktwowaybinding', [function () {
    return {
        scope: {
            flavor: '='
        },
        template: '<input type="text" ng-model="flavor">'
    };
}]);

// & allows you to evaluate an expression on the parent scope
// This is going to take the dial attribute in the html, which is set equal to callHome(). ng-click is going to call
// dial(), which passes to the scope, which attached to the parent scope, and call the original value of the dial
// attribute, which is callHome(), on the parent scope.
// When you pass in an object to the dial function, it's attaching that value to the parameter on the parent scope.
// Here, ng-model is value. We're passing it in as the value of message. Message on the parent scope's function
// gets the value of value as a result. Note it's also passed in as message on the html.
app.directive('phone', [function () {
    return {
        scope: {
            dial: '&'
        },
        template: '<input type="text" ng-model="value">' +
                  '<button ng-click="dial({message:value})">Call home</button>'
    };
}]);

