'use strict';

describe('minifyMenu directive', function () {
    var scope, element, $body, span;
    beforeEach(function () {
        module('mean');
        module('mean.system');
        module('mean.navigation', function ($provide) {
            $provide.factory('User', UserMock);
        });
    });

    beforeEach(inject(function ($compile, $rootScope) {
        scope = $rootScope.$new();
        // This seems like a really bad way of doing this, but $compile removes html and body tags
        var body = $compile('<body></body>')(scope);
        element = '<span class="minifyme" data-action="minifyMenu" minify-menu><i class="fa fa-arrow-circle-left hit"></i></span>';
        body.append(element);
        var html = '<html></html>';
        html = $compile(html)(scope);
        html.append(body);
        element = html;
        // Compile element and digest
        element = $compile(element)(scope);
        scope.$digest();
        $body = $('body');
        span = element.find('span');
        // This is bad form, I need to account for Pace
        $body.removeClass('pace-running');
    }));

    describe('click', function () {
        it('should toggle the minified class', function () {
            expect($body.attr('class')).toBe('');
            $(span).trigger('click');
            expect($body.attr('class')).toBe('minified');
        });

        it('should remove the hidden-menu classes', function () {
            $body.addClass('hidden-menu');
            expect($body.attr('class')).toBe('minified hidden-menu');
            $(span).trigger('click');
            expect($body.attr('class')).toBe('');
        });

        it('should removed the hidden-menu-mobile-lock class from the html element', function () {
            var $html = $('html');
            $html.addClass('hidden-menu-mobile-lock');
            $(span).trigger('click');
            expect($html.attr('class')).toBe('');
        });
    });
});