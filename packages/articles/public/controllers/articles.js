'use strict';

var app = angular.module('mean.articles');

app.controller('ArticlesController',
['$scope', '$stateParams', '$location', 'Global', 'Articles',
 function ($scope, $stateParams, $location, Global, Articles) {
     $scope.global = Global;
     /**
      * Check if the user has authorization
      *
      * @param article
      * @returns {*}
      */
     $scope.hasAuthorization = function (article) {
         if (!article || !article.user) {
             return false;
         }
         return $scope.global.isAdmin || article.user._id === $scope.global.user._id;
     };
     /**
      * Create a new article
      * @param isValid
      */
     $scope.create = function (isValid) {
         if (isValid) {
             var article = new Articles({
                 title: this.title,
                 content: this.content
             });
             article.$save(function (response) {
                 $location.path('articles/' + response._id);
             });

             this.title = '';
             this.content = '';
         } else {
             $scope.submitted = true;
         }
     };

     $scope.remove = function (article) {
         if (article) {
             article.$remove();

             for (var i in $scope.articles) {
                 if ($scope.articles[i] === article) {
                     $scope.articles.splice(i, 1);
                 }
             }
         } else {
             $scope.article.$remove(function (response) {
                 $location.path('articles');
             });
         }
     };

     $scope.update = function (isValid) {
         if (isValid) {
             var article = $scope.article;
             if (!article.updated) {
                 article.updated = [];
             }
             article.updated.push(new Date().getTime());

             article.$update(function () {
                 $location.path('articles/' + article._id);
             });
         } else {
             $scope.submitted = true;
         }
     };

     /**
      * Find a single item
      */
     $scope.find = function () {
         Articles.query(function (articles) {
             $scope.articles = articles;
         });
     };

     $scope.findOne = function () {
         Articles.get({
             articleId: $stateParams.articleId
         }, function (article) {
             $scope.article = article;
         });
     };

     $scope.ctrlFlavor = {
         data : 'blackberry'
     };

     $scope.updateFoo = function (newFoo) {
         $scope.ctrlFlavor.data = newFoo;
     };

     $scope.logChore = function(chore){
         console.log(chore + ' is done');
     };
 }]);

app.controller('TestController', ['$scope', 'Data', function ($scope, Data) {
    $scope.data = Data;
}]);

app.controller('TestController2', ['$scope', 'Data', function ($scope, Data) {
    $scope.data = Data;
}]);