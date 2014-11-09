/*
 Simple mock for socket.io
 see: https://github.com/btford/angular-socket-io-seed/issues/4
 thanks to https://github.com/southdesign for the idea
 */
var SocketMock = function($rootScope) {
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
};

/**
* Mock the initial querying of tasks
*
* @param $q
*/
var MockTasklistService = function ($q) {
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
    // Fake something to return
    this.created = {user: "5434f0215d1bbcf87764b996", title: "mock title", content: "mock content"};

    var that = this;

    return {
        init: function () {
            var defer = $q.defer();
            defer.resolve(that.data);
            return defer.promise;
        },
        create: function () {
            var deferred = $q.defer();
            deferred.resolve(that.created);
            return deferred.promise;
        }
    };
};

/**
 * Mocking global strings
 * @returns {{data: {user: string, authenticated: boolean, isAdmin: boolean}, tasklist: {strings: {name: string, project: string}}}}
 * @constructor
 */
var GlobalMock = function () {
    return {
        data: {
            user: 'logan',
            authenticated: true,
            isAdmin: true
        },
        tasklist: {
            strings: {
                name: 'Mock Task list',
                project: 'Mock Setting up'
            }
        }
    };
};