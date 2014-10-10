/* global browser*/
'use strict';

/* http://docs.angularjs.org/guide/dev_guide.e2e-testing */

describe('PhoneCat App', function () {

    it('should redirect index.html to index.html#/phones', function () {
        browser.get('');
        expect(browser.getTitle()).toEqual('MEAN - A Modern Stack - Test');
    });
});
