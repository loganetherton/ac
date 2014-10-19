'use strict';

angular.module('mean.system').controller('IndexController', ['$scope', 'Global',
  function($scope, Global) {
    $scope.global = Global;
  }
]);

angular.module('mean.system').controller('InvoiceController', ['$scope', 'currencyConverter', function($scope, currencyConverter){
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