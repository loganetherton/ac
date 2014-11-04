/*global inject:false */
'use strict';

(function () {
    /*
     Simple mock for socket.io
     see: https://github.com/btford/angular-socket-io-seed/issues/4
     thanks to https://github.com/southdesign for the idea
     */
    var sockMock = function($rootScope) {
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
    var mockTasklistServiceFunc = function ($q) {
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

            defer.resolve(that);

            return defer.promise;
        };
    };

    /**
     * @todo When I include both the mock socket and mock Tasklist service, it seems to lose access to the socket. Why?
     */
    describe('Controller: Tasklist', function () {
        var scope, socketMock;

        beforeEach(function () {
            module('mean');
            module('mean.system');
            module('mean.tasklist');
        });

        //mock the controller for the same reason and include $rootScope and $controller
        beforeEach(inject(function($rootScope, $controller, $q){
            //create an empty scope
            scope = $rootScope.$new();

            socketMock = new sockMock($rootScope);

            var TasklistService = new mockTasklistServiceFunc($q);

            // Declare controller, inject mock socket and mock tasklist service
            $controller('TasklistController', {$scope: scope, TasklistService: TasklistService, SocketService: socketMock});

            scope.$digest();
        }));

        it('should get access to global tasklist strings object', function () {
            expect(typeof scope.strings).toEqual();
        });

        it('should immediately call Tasklist.init() and add the return to $scope.tasks', function () {
            expect(scope.tasks).toEqual([
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
            ]);
        });

        it('should accept emitted tasks and add them to tasks array', function(){
            socketMock.receive('newTask', {
                data: {
                    $$hashKey: 'object:42',
                    user: '5434f0215d1bbcf87764b996',
                    title: 'test title',
                    content: 'test content'
                }
            });
            // Emitted tasks should get pushed onto the tasks array
            expect(scope.tasks).toEqual(
                [{
                     $$hashKey: 'object:42',
                     user: '5434f0215d1bbcf87764b996',
                     title: 'test title',
                     content: 'test content'
                 }, {
                     __v: 0,
                     _id: '5458888a70b39cf36ca711e7',
                     content: 'testContent',
                     created: '2014-11-04T08:04:26.526Z',
                     title: 'testTitle',
                     user: {
                         _id: '5434f0215d1bbcf87764b996', name: 'Logan Etherton', username: 'loganetherton'
                     }
                 }, {
                     __v: 0,
                     _id: '545882cc37f38bcf69f0b82d',
                     content: 'testContent2',
                     created: '2014-11-04T08:04:26.526Z',
                     title: 'testTitle2',
                     user: {
                         _id: '5434f0215d1bbcf87764b996', name: 'Logan Etherton', username: 'loganetherton'
                     }
                 }
                ]
            );
        });
    });
}());
