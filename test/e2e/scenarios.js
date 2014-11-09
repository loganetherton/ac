/* global browser, element, by*/
'use strict';

/* https://docs.angularjs.org/guide/e2e-testing */

describe('Egghead.io videos', function () {

    browser.get('');
    // Note that changing describe to ddescribe or it to itt will only run that describe or it instance, no others
    describe('some setup bullshit', function () {
        it('should correctly display the title', function () {
            expect(browser.getTitle()).toEqual('MEAN - A Modern Stack - Test');
        });
    });

    describe('login should function', function () {
        browser.pause();
    });

    //describe('directive:drinkTwoWayBinding', function () {
    //    it('should keep the directives bound by = bound to the model', function () {
    //        //var flavor = element(by.model('flavor'));
    //        //console.log(flavor);
    //        var flavor = element.all(by.model('flavor'));
    //        // Make sure two are displayed
    //        expect(flavor.count()).toBe(2);
    //        // Write something
    //        flavor.get(0).clear().sendKeys('I AM A ROBOT');
    //        setTimeout(function(){
    //
    //        }, 5000);
    //        expect(flavor.get(0).getAttribute('value')).toBe('I AM A ROBOT');
    //        expect(flavor.get(1).getAttribute('value')).toBe('I AM A ROBOT');
    //    });
    //});
    //
    //describe('directive:phone', function () {
    //    it('should call the parent function and write to console', function () {
    //        element(by.model('$parent.data.something')).sendKeys('call');
    //        // Click the button
    //        $('section[data-ng-controller="CallHomeController"] button').click();
    //        expect($('.callHomeOutput').getText()).toBe('called home with call');
    //    });
    //});
    //
    //describe('directive:transclusionTest', function () {
    //    it('should still show the button', function () {
    //        expect($('.row.ng-scope[transclusiontest] [ng-transclude]').getText()).toBe('Button');
    //    });
    //});
    //
    //describe('directive:zippy', function () {
    //    var zippyTitle = element.all(by.css('zippy[title] div')).get(0);
    //    var zippyContent = $('zippy span');
    //    it('should display the title as it\'s written', function () {
    //        // Write something for the title
    //        element(by.model('zippy.title')).sendKeys('Zippy title');
    //        // Make sure the title was written
    //        expect(zippyTitle.getText()).toMatch(/Zippy title/);
    //    });
    //
    //    it('should not display the content until it\'s toggled', function () {
    //        element(by.model('zippy.content')).sendKeys('Zippy content');
    //        // Verify the content can't be seen
    //        expect(zippyContent.isDisplayed()).toBeFalsy();
    //    });
    //
    //    it('should display the content on toggle', function () {
    //        zippyTitle.click();
    //        expect(zippyContent.isDisplayed()).toBeTruthy();
    //    });
    //});
    //
    //describe('directive:compileTest', function () {
    //    var compileTestInput = element(by.model('compileTest.content'));
    //    it('should show glyphicon on match', function () {
    //        compileTestInput.sendKeys('match');
    //        var spanOutput = element(by.binding('compileTest.content'));
    //        // Note that things like getInnerHtml() return promise events, which are resolved naturally by expect()
    //        // and can be resolved manually by then()
    //        expect(spanOutput.getInnerHtml()).toMatch(/glyphicon/);
    //    });
    //});
});
