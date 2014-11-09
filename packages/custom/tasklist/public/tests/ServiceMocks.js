/*
 Simple mock for socket.io
 see: https://github.com/btford/angular-socket-io-seed/issues/4
 thanks to https://github.com/southdesign for the idea
 */
//var SocketMock = function($rootScope) {
//    this.events = {};
//    this.emits = {};
//
//    // Mock init, which removed event listeners to the real code
//    this.init = function () {};
//
//    // intercept 'on' calls and capture the callbacks
//    this.on = function (eventName, callback) {
//        if (!this.events[eventName]) this.events[eventName] = [];
//        this.events[eventName].push(callback);
//    };
//
//    // intercept 'emit' calls from the client and record them to assert against in the test
//    this.emit = function (eventName) {
//        var args = Array.prototype.slice.call(arguments, 1);
//
//        if (!this.emits[eventName])
//            this.emits[eventName] = [];
//        this.emits[eventName].push(args);
//    };
//
//    //simulate an inbound message to the socket from the server (only called from the test)
//    this.receive = function (eventName) {
//        var args = Array.prototype.slice.call(arguments, 1);
//
//        if (this.events[eventName]) {
//            angular.forEach(this.events[eventName], function (callback) {
//                $rootScope.$apply(function () {
//                    callback.apply(this, args);
//                });
//            });
//        }
//    };
//};
//
///**
// * Mock the initial querying of tasks
// *
// * @param $q
// */
//var MockTasklistService = function ($q) {
//    this.data = [
//        {
//            __v: 0,
//            _id: "5458888a70b39cf36ca711e7",
//            content: "testContent",
//            created: "2014-11-04T08:04:26.526Z",
//            title: "testTitle",
//            user: {
//                _id: "5434f0215d1bbcf87764b996",
//                name: "Logan Etherton",
//                username: "loganetherton"
//            }
//        },
//        {
//            __v: 0,
//            _id: "545882cc37f38bcf69f0b82d",
//            content: "testContent2",
//            created: "2014-11-04T08:04:26.526Z",
//            title: "testTitle2",
//            user: {
//                _id: "5434f0215d1bbcf87764b996",
//                name: "Logan Etherton",
//                username: "loganetherton"
//            }
//        }
//    ];
//    var that = this;
//    MockTasklistService.init = function () {
//        var defer = $q.defer();
//        defer.resolve(that.data);
//        return defer.promise;
//    };
//};

/**
 * Overwrite the previously injected items
 */
var app = angular.module('mean.tasklist');

/**
 * Mocking tasklsit to only return specific, predefined data
 */
app.factory('TasklistService', ['$q', function ($q) {
    this.data = [
        {
            __v: 0,
            _id: "5458888a70b39cf36ca711e7",
            content: "testContent",
            created: "2014-11-04T08:04:26.526Z",
            title: "testTitle",
            user: {
                _id: "5434f0215d1bbcf87764b996",
                name: "Logan Etherton",
                username: "loganetherton"
            },
            $$hashKey: 'object:12'
        },
        {
            __v: 0,
            _id: "545882cc37f38bcf69f0b82d",
            content: "testContent2",
            created: "2014-11-04T08:04:26.526Z",
            title: "testTitle2",
            user: {
                _id: "5434f0215d1bbcf87764b996",
                name: "Logan Etherton",
                username: "loganetherton"
            },
            $$hashKey: 'object:13'
        }
    ];
    var that = this;
    return {
        // Get an initial listing of tasks, return promise
        init: function(){
            var defer = $q.defer();
            defer.resolve(that.data);
            return defer.promise;
        }
    };
}]);

/**
 * Mocking socket service to fake socket connections
 */
app.factory('SocketService', ['$rootScope', function ($rootScope) {
    this.events = {};
    this.emits = {};
    var that = this;
    return {
        init: function () {},
        on: function (eventName, callback) {
            if (!that.events[eventName]) that.events[eventName] = [];
            that.events[eventName].push(callback);
        },
        emit: function (eventName) {
            var args = Array.prototype.slice.call(arguments, 1);

            if (!that.emits[eventName])
                that.emits[eventName] = [];
            that.emits[eventName].push(args);
        },
        receive: function (eventName) {
            var args = Array.prototype.slice.call(arguments, 1);

            if (that.events[eventName]) {
                angular.forEach(that.events[eventName], function (callback) {
                    $rootScope.$apply(function () {
                        callback.apply(that, args);
                    });
                });
            }
        }
    };
}]);