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

    var mockTasklistService = function () {
        this.data = [
            {
                content: '6',
                created: '2014-11-04T08:04:26.526Z',
                title: '6'
            }
        ];
        var that = this;
        this.init = function () {
            var defer = $q.defer();

            defer.resolve(that.data);

            return defer.promise;
        };
    };

    ddescribe('Controller: Tasklist', function () {
        var scope, socketMock;

        beforeEach(function () {
            var mockTasklistService = {};
            module('mean');
            module('mean.system');
            module('mean.tasklist', function ($provide) {
                $provide.value('restService', mockTasklistService);
            });

            inject(function($q) {
                mockTasklistService.data = [
                    {
                        id: 0,
                        name: 'Angular'
                    },
                    {
                        id: 1,
                        name: 'Ember'
                    },
                    {
                        id: 2,
                        name: 'Backbone'
                    },
                    {
                        id: 3,
                        name: 'React'
                    }
                ];
                // Just overwriting the actual service calls so we can test the controller, not the service
                mockTasklistService.getAll = function() {
                    var defer = $q.defer();

                    defer.resolve(this.data);

                    return defer.promise;
                };

                mockTasklistService.create = function(name) {
                    var defer = $q.defer();

                    var id = this.data.length;

                    var item = {
                        id: id,
                        name: name
                    };

                    this.data.push(item);
                    defer.resolve(item);

                    return defer.promise;
                };
            });
        });

        //mock the controller for the same reason and include $rootScope and $controller
        beforeEach(inject(function($rootScope, $controller){
            //create an empty scope
            scope = $rootScope.$new();

            socketMock = new sockMock($rootScope);

            //declare the controller and inject our empty scope
            $controller('TasklistController', {$scope: scope, SocketService: socketMock});
        }));

        it('should accept emitted tasks and add them to tasks array', function(){
            socketMock.receive('newTask', {
                data: {
                    $$hashKey: 'object:42',
                    user: '5434f0215d1bbcf87764b996',
                    title: 'test title',
                    content: 'test content'
                }
            });
            // Make sure on emit that tasks get pushed
            expect(scope.tasks).toEqual([{
                $$hashKey: 'object:42',
                user: '5434f0215d1bbcf87764b996',
                title: 'test title',
                content: 'test content'
            }]);
        });

        it('should immediately call Tasklist.init() and add the return to $scope.tasks', function () {

        });
    });
}());
