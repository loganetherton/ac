'use strict';

var app = angular.module('mean.system');

app.controller('IndexController', ['$scope', 'Global', function ($scope, Global) {
    $scope.global = Global;
}]);

app.controller('InvoiceController', ['$scope', 'currencyConverter', function($scope, currencyConverter){
    $scope.qty = 10;
    $scope.cost = 2;
    $scope.inCurr = 'USD';
    $scope.currencies = currencyConverter.currencies;

    $scope.total = function total(outCurr) {
        return currencyConverter.convert($scope.qty * $scope.cost, $scope.inCurr, outCurr);
    };
    $scope.pay = function pay() {
        window.alert('Thanks!');
    };
}]);

app.controller('SuperheroDirController', ['$scope', function ($scope) {
    $scope.abilities = [];

    this.addStrength = function () {
        $scope.abilities.push('strength');
    };

    this.addFlight = function () {
        $scope.abilities.push('flight');
    };

    this.addSpeed = function () {
        $scope.abilities.push('speed');
    };
}]);

app.controller('KidController', ['$scope', function ($scope) {
    $scope.chore = 'stuff';

    $scope.logChore = function (task) {
        console.log(task + ' is done');
    };
}]);

app.controller('DrinkController', ['$scope', function ($scope) {
    $scope.data = {};
    $scope.data.ctrlFlavor = 'blackberry';

    //$scope.$watch('data.ctrlFlavor', function(newVal, oldVal){
    //    console.log(newVal);
    //});
}]);

app.controller('CallHomeController', ['$scope', function ($scope) {
    $scope.callHome = function (message) {
        $scope.data.something = 'called home with ' + message;
        console.log($scope.data.something);
    };

    $scope.data = {};

    //console.log('within controller');
    //console.log($scope);

    //$scope.data.something = 'something';
    //
    //$scope.$watch('data.something', function(newVal, oldVal){
    //    console.log('controller');
    //});
}]);