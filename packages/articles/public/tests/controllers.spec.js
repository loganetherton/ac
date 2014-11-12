'use strict';

(function () {
    // Articles Controller Spec
    describe('MEAN controllers', function () {
        //describe('ArticlesController', function () {
        //    // The $resource service augments the response object with methods for updating and deleting the resource.
        //    // If we were to use the standard toEqual matcher, our tests would fail because the test values would not match
        //    // the responses exactly. To solve the problem, we use a newly-defined toEqualData Jasmine matcher.
        //    // When the toEqualData matcher compares two objects, it takes only object properties into
        //    // account and ignores methods.
        //    beforeEach(function () {
        //        this.addMatchers({
        //            toEqualData: function (expected) {
        //                return angular.equals(this.actual, expected);
        //            }
        //        });
        //    });
        //
        //    beforeEach(function () {
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles');
        //    });
        //
        //    // Initialize the controller and a mock scope
        //    var ArticlesController, scope, $httpBackend, $stateParams, $location;
        //
        //    // The injector ignores leading and trailing underscores here (i.e. _$httpBackend_).
        //    // This allows us to inject a service but then attach it to a variable
        //    // with the same name as the service.
        //    beforeEach(inject(function ($controller, $rootScope, _$location_, _$stateParams_, _$httpBackend_) {
        //
        //        scope = $rootScope.$new();
        //
        //        ArticlesController = $controller('ArticlesController', {
        //            $scope: scope
        //        });
        //
        //        $stateParams = _$stateParams_;
        //
        //        $httpBackend = _$httpBackend_;
        //
        //        $location = _$location_;
        //
        //    }));
        //
        //    it('$scope.find() should create an array with at least one article object ' + 'fetched from XHR',
        //    function () {
        //
        //        // test expected GET request
        //        $httpBackend.expectGET('articles').respond([{
        //                                                        title: 'An Article about MEAN', content: 'MEAN rocks!'
        //                                                    }]);
        //
        //        // run controller
        //        scope.find();
        //        $httpBackend.flush();
        //
        //        // test scope value
        //        expect(scope.articles).toEqualData([{
        //                                                title: 'An Article about MEAN', content: 'MEAN rocks!'
        //                                            }]);
        //
        //    });
        //
        //    it('$scope.findOne() should create an array with one article object fetched ' +
        //       'from XHR using a articleId URL parameter', function () {
        //        // fixture URL parament
        //        $stateParams.articleId = '525a8422f6d0f87f0e407a33';
        //
        //        // fixture response object
        //        var testArticleData = function () {
        //            return {
        //                title: 'An Article about MEAN', content: 'MEAN rocks!'
        //            };
        //        };
        //
        //        // test expected GET request with response object
        //        $httpBackend.expectGET(/articles\/([0-9a-fA-F]{24})$/).respond(testArticleData());
        //
        //        // run controller
        //        scope.findOne();
        //        $httpBackend.flush();
        //
        //        // test scope value
        //        expect(scope.article).toEqualData(testArticleData());
        //
        //    });
        //
        //    it('$scope.create() with valid form data should send a POST request ' +
        //       'with the form input values and then ' + 'locate to new object URL', function () {
        //
        //        // fixture expected POST data
        //        var postArticleData = function () {
        //            return {
        //                title: 'An Article about MEAN', content: 'MEAN rocks!'
        //            };
        //        };
        //
        //        // fixture expected response data
        //        var responseArticleData = function () {
        //            return {
        //                _id: '525cf20451979dea2c000001', title: 'An Article about MEAN', content: 'MEAN rocks!'
        //            };
        //        };
        //
        //        // fixture mock form input values
        //        scope.title = 'An Article about MEAN';
        //        scope.content = 'MEAN rocks!';
        //
        //        // test post request is sent
        //        $httpBackend.expectPOST('articles', postArticleData()).respond(responseArticleData());
        //
        //        // Run controller
        //        scope.create(true);
        //        $httpBackend.flush();
        //
        //        // test form input(s) are reset
        //        expect(scope.title).toEqual('');
        //        expect(scope.content).toEqual('');
        //
        //        // test URL location to new object
        //        expect($location.path()).toBe('/articles/' + responseArticleData()._id);
        //    });
        //
        //    it('$scope.update(true) should update a valid article', inject(function (Articles) {
        //
        //        // fixture rideshare
        //        var putArticleData = function () {
        //            return {
        //                _id: '525a8422f6d0f87f0e407a33', title: 'An Article about MEAN', to: 'MEAN is great!'
        //            };
        //        };
        //
        //        // mock article object from form
        //        var article = new Articles(putArticleData());
        //
        //        // mock article in scope
        //        scope.article = article;
        //
        //        // test PUT happens correctly
        //        $httpBackend.expectPUT(/articles\/([0-9a-fA-F]{24})$/).respond();
        //
        //        // testing the body data is out for now until an idea for testing the dynamic updated array value is figured out
        //        //$httpBackend.expectPUT(/articles\/([0-9a-fA-F]{24})$/, putArticleData()).respond();
        //        /*
        //         Error: Expected PUT /articles\/([0-9a-fA-F]{24})$/ with different data
        //         EXPECTED: {"_id":"525a8422f6d0f87f0e407a33","title":"An Article about MEAN","to":"MEAN is great!"}
        //         GOT:      {"_id":"525a8422f6d0f87f0e407a33","title":"An Article about MEAN","to":"MEAN is great!","updated":[1383534772975]}
        //         */
        //
        //        // run controller
        //        scope.update(true);
        //        $httpBackend.flush();
        //
        //        // test URL location to new object
        //        expect($location.path()).toBe('/articles/' + putArticleData()._id);
        //
        //    }));
        //
        //    it('$scope.remove() should send a DELETE request with a valid articleId ' +
        //       'and remove the article from the scope', inject(function (Articles) {
        //
        //        // fixture rideshare
        //        var article = new Articles({
        //            _id: '525a8422f6d0f87f0e407a33'
        //        });
        //
        //        // mock rideshares in scope
        //        scope.articles = [];
        //        scope.articles.push(article);
        //
        //        // test expected rideshare DELETE request
        //        $httpBackend.expectDELETE(/articles\/([0-9a-fA-F]{24})$/).respond(204);
        //
        //        // run controller
        //        scope.remove(article);
        //        $httpBackend.flush();
        //
        //        // test after successful delete URL location articles list
        //        //expect($location.path()).toBe('/articles');
        //        expect(scope.articles.length).toBe(0);
        //
        //    }));
        //});
        //// Test the reverse filter
        //describe('Filter:reverse', function () {
        //    beforeEach(function () {
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles');
        //    });
        //
        //    var reverse;
        //
        //    beforeEach(inject(function (_reverseFilter_) {
        //        reverse = _reverseFilter_;
        //    }));
        //
        //    it('should reverse words', function () {
        //        expect(reverse('hello')).toBe('olleh');
        //        expect(reverse('hello', 2)).toBe('ehllo');
        //    });
        //});
        //
        //// Testing the service
        //describe('reddit api service', function () {
        //    var userService, httpBackend;
        //
        //    beforeEach(function () {
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles');
        //    });
        //
        //    beforeEach(inject(function (_userService_, $httpBackend) {
        //        userService = _userService_;
        //        httpBackend = $httpBackend;
        //    }));
        //
        //    it('should do something', function () {
        //        httpBackend.whenGET('http://api.reddit.com/user/yoitsnate/submitted.json').respond({
        //            data: {
        //                children: [{
        //                               data: {
        //                                   subreddit: 'golang'
        //                               }
        //                           }, {
        //                               data: {
        //                                   subreddit: 'javascript'
        //                               }
        //                           }, {
        //                               data: {
        //                                   subreddit: 'golang'
        //                               }
        //                           }, {
        //                               data: {
        //                                   subreddit: 'javascript'
        //                               }
        //                           }]
        //            }
        //        });
        //        userService.getSubredditsSubmittedToBy('yoitsnate').then(function(subreddits) {
        //            expect(subreddits).toEqual(['golang', 'javascript']);
        //        });
        //        httpBackend.flush();
        //    });
        //});
        //
        //describe('Service:logger', function () {
        //    var logger;
        //    beforeEach(function () {
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles');
        //    });
        //
        //    beforeEach(inject(function (_logger_) {
        //        logger = _logger_;
        //
        //        spyOn(console, 'log');
        //    }));
        //
        //    it('should call console.log', function () {
        //        logger.log('hello');
        //        expect(console.log).toHaveBeenCalledWith('hello');
        //    });
        //});
        //
        //
        //
        //describe('Controller:ListLibrariesController', function () {
        //    var scope, restService, $location;
        //
        //    beforeEach(function() {
        //        var mockRestService = {};
        //
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles', function($provide) {
        //            $provide.value('restService', mockRestService);
        //        });
        //
        //        inject(function($q) {
        //            mockRestService.data = [
        //                {
        //                    id: 0,
        //                    name: 'Angular'
        //                },
        //                {
        //                    id: 1,
        //                    name: 'Ember'
        //                },
        //                {
        //                    id: 2,
        //                    name: 'Backbone'
        //                },
        //                {
        //                    id: 3,
        //                    name: 'React'
        //                }
        //            ];
        //            // Just overwriting the actual service calls so we can test the controller, not the service
        //            mockRestService.getAll = function() {
        //                var defer = $q.defer();
        //
        //                defer.resolve(this.data);
        //
        //                return defer.promise;
        //            };
        //
        //            mockRestService.create = function(name) {
        //                var defer = $q.defer();
        //
        //                var id = this.data.length;
        //
        //                var item = {
        //                    id: id,
        //                    name: name
        //                };
        //
        //                this.data.push(item);
        //                defer.resolve(item);
        //
        //                return defer.promise;
        //            };
        //        });
        //    });
        //
        //    beforeEach(inject(function($controller, $rootScope, _$location_, _restService_) {
        //        scope = $rootScope.$new();
        //        $location = _$location_;
        //        restService = _restService_;
        //
        //        $controller('ListLibrariesCtrl', {$scope: scope, $location: $location, restService: restService });
        //
        //        scope.$digest();
        //    }));
        //
        //    it('should contain all the libraries at startup', function () {
        //        expect(scope.libraries).toEqual([
        //            {
        //                id: 0,
        //                name: 'Angular'
        //            },
        //            {
        //                id: 1,
        //                name: 'Ember'
        //            },
        //            {
        //                id: 2,
        //                name: 'Backbone'
        //            },
        //            {
        //                id: 3,
        //                name: 'React'
        //            }
        //        ]);
        //    });
        //
        //    it('should create new libraries and append them to the list', function () {
        //        // Simulate a new library name
        //        scope.newItemName = 'bleh';
        //        // And then a button is clicked or something
        //        scope.create();
        //
        //        var lastLibrary = scope.libraries[scope.libraries.length - 1];
        //
        //        expect(lastLibrary).toEqual({
        //            id: 4,
        //            name: 'bleh'
        //        });
        //    });
        //});
        //
        //describe('directive: svg-circle', function () {
        //    var element, scope;
        //
        //    beforeEach(function () {
        //        module('mean');
        //        module('mean.system');
        //        module('mean.articles');
        //    });
        //    // We need to compile the directive before testing it
        //    beforeEach(inject(function ($rootScope, $compile) {
        //        scope = $rootScope.$new();
        //
        //        element = '<svg-circle size="{{size}}" stroke="black" fill="blue"></svg-circle>';
        //
        //        scope.size = 100;
        //
        //        element = $compile(element)(scope);
        //        scope.$digest();
        //    }));
        //
        //    describe('with the first given value', function() {
        //        it('should compute the size to create other values', function() {
        //            var isolated = element.isolateScope();
        //            expect(isolated.values.canvas).toBe(250);
        //            expect(isolated.values.center).toBe(125);
        //            expect(isolated.values.radius).toBe(100);
        //        });
        //
        //        it('should contain a svg tag with proper size', function() {
        //            expect(element.attr('height')).toBe('250');
        //            expect(element.attr('width')).toBe('250');
        //        });
        //
        //        it('should contain a circle with proper attributes', function() {
        //            expect(element.find('circle').attr('cx')).toBe('125');
        //            expect(element.find('circle').attr('cy')).toBe('125');
        //            expect(element.find('circle').attr('r')).toBe('100');
        //            expect(element.find('circle').attr('stroke')).toBe('black');
        //            expect(element.find('circle').attr('fill')).toBe('blue');
        //        });
        //    });
        //
        //    describe('when changing the initial value to a different one', function() {
        //
        //        beforeEach(function() {
        //            scope.size = 160;
        //            // Process changes
        //            scope.$digest();
        //        });
        //
        //        it('should compute the size to create other values', function() {
        //            var isolated = element.isolateScope();
        //            expect(isolated.values.canvas).toBe(400);
        //            expect(isolated.values.center).toBe(200);
        //            expect(isolated.values.radius).toBe(160);
        //        });
        //
        //        it('should contain a svg tag with proper size', function() {
        //            expect(element.attr('height')).toBe('400');
        //            expect(element.attr('width')).toBe('400');
        //        });
        //
        //        it('should contain a circle with proper attributes', function() {
        //            expect(element.find('circle').attr('cx')).toBe('200');
        //            expect(element.find('circle').attr('cy')).toBe('200');
        //            expect(element.find('circle').attr('r')).toBe('160');
        //            expect(element.find('circle').attr('stroke')).toBe('black');
        //            expect(element.find('circle').attr('fill')).toBe('blue');
        //        });
        //    });
        //});
    });
}());
