/*
 Simple mock for socket.io
 see: https://github.com/btford/angular-socket-io-seed/issues/4
 thanks to https://github.com/southdesign for the idea
 */
var SocketMock = function($rootScope) {
    this.events = {};
    this.emits = {};

    // Mock init, which removed event listeners to the real code
    this.init = function () {};

    // intercept 'on' calls and capture the callbacks
    this.on = function (eventName, callback) {
        if (!this.events[eventName]) this.events[eventName] = [];
        this.events[eventName].push(callback);
    };

    // intercept 'emit' calls from the client and record them to assert against in the test
    this.emit = function (eventName) {
        var args = Array.prototype.slice.call(arguments, 1);

        if (!this.emits[eventName])
            this.emits[eventName] = [];
        this.emits[eventName].push(args);
    };

    //simulate an inbound message to the socket from the server (only called from the test)
    this.receive = function (eventName) {
        var args = Array.prototype.slice.call(arguments, 1);

        if (this.events[eventName]) {
            angular.forEach(this.events[eventName], function (callback) {
                $rootScope.$apply(function () {
                    callback.apply(this, args);
                });
            });
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
            }
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
            }
        }
    ];
    var that = this;
    this.init = function () {
        var defer = $q.defer();
        defer.resolve(that.data);
        return defer.promise;
    };
};