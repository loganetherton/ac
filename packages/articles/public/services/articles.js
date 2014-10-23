'use strict';

var app = angular.module('mean.articles');

//Articles service used for articles REST endpoint
app.factory('Articles', ['$resource',
  function($resource) {
    return $resource('articles/:articleId', {
      articleId: '@_id'
    }, {
      update: {
        method: 'PUT'
      }
    });
  }
]);

// Testing
app.factory('Data', [function () {
    return {
        info: function(){
            console.log('Logging from data');
        },
        message: 'I\'m data from a service'
    };
}]);

app.factory('logger', [function () {

    var types = {
        'log': 'info',
        'debug': 'warning',
        'error': 'error'
    };

    var log = function(message, type, toast) {
        if (typeof type === 'boolean') {
            toast = type;
        }

        if (!types.hasOwnProperty(type)) {
            type = 'log';
        }

        console[type](message);

        //if (toast) {
        //    toastr[types[type]](message);
        //}
    };

    return {
        log: log
    };

}]);

app.factory('userService', ['$http', function ($http) {
    return {
        getSubredditsSubmittedToBy: function (user) {
            return $http.get('http://api.reddit.com/user/' + user + '/submitted.json').then(function (response) {
                var posts, subreddits;

                posts = response.data.data.children;

                // transform data to be only subreddit strings
                subreddits = posts.map(function (post) {
                    return post.data.subreddit;
                });

                // de-dupe
                subreddits = subreddits.filter(function (element, position) {
                    return subreddits.indexOf(element) === position;
                });

                return subreddits;
            });
        }
    };
}]);

app.factory('logger', [function () {
    return {
        log: function(message){
            console.log(message);
        }
    };
}]);

app.factory('fakeJson', [function () {
    var fakeJson = {};

    fakeJson.data = [{
                         'name': 'Earlene Crane', 'gender': 'female'
                     }, {
                         'name': 'Ross Gamble', 'gender': 'male'
                     }, {
                         'name': 'Elinor Bender', 'gender': 'female'
                     }, {
                         'name': 'Romero Zamora', 'gender': 'male'
                     }, {
                         'name': 'Clemons Holcomb', 'gender': 'male'
                     }, {
                         'name': 'Harriett Beck', 'gender': 'female'
                     }];

    return fakeJson;
}]);