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

     $scope.updateFoo = function (newFoo) {
         $scope.ctrlFlavor.data = newFoo;
     };

     $scope.logChore = function (chore) {
         console.log(chore + ' is done');
     };
 }]);

app.controller('TestController', ['$scope', 'Data', 'userService', function ($scope, Data, userService) {
    $scope.data = Data;
    userService.getSubredditsSubmittedToBy('yoitsnate').then(function(subreddits) {
        $scope.subreddits = subreddits;
    });
}]);

app.controller('TestController2', ['$scope', 'Data', function ($scope, Data) {
    $scope.data = Data;
}]);

app.controller('ListLibrariesCtrl', ['$scope', '$location', 'restService', function ($scope, $location, restService) {
    restService.getAll().then(function(items){
        $scope.libraries = items;
    });

    $scope.create = function(){
        restService.create($scope.newItemName).then(function(item){
            $scope.libraries.push(item);
        });
    };
}]);

app.controller('fakeJsonCtrl', ['$scope', 'fakeJson', function ($scope, fakeJson) {
    $scope.fakeJson = fakeJson;
}]);