define([
    'app/_InProgressCacheMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!app/tests/spec/templates/TestWidget.html',
    'dojo/_base/declare',

    'localforage'
], function (
    _InProgressCacheMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    testTemplate,
    declare,

    localforage
) {
    describe('app/_InProgressCacheMixin', function () {
        var TestWidget = declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _InProgressCacheMixin], {
            templateString: testTemplate,
            widgetsInTemplate: true
        });
        var testWidget;
        var someValue = 'someValue';
        var anotherValue = 'anotherValue';
        var textAreaValue = 'textAreaValue';
        var onError = function (error) {
            console.error(error);
        };

        beforeEach(function (done) {
            localforage.clear().then(function () {
                testWidget = new TestWidget({
                    cacheId: 'TestWidget',
                    template: testTemplate
                }, domConstruct.create('div', null, document.body));
                testWidget.startup();

                done();
            });
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        it('stores changes to controls (with data-dojo-attach-point attributes only) in localforage', function (done) {
            testWidget.someBox.value = someValue;
            testWidget.anotherBox.value = anotherValue;
            testWidget.textArea.value = textAreaValue;
            document.getElementById('skipBox').value = 'blah';

            testWidget.cacheInProgressData().then(function () {
                localforage.getItem(testWidget.cacheId).then(function (value) {
                    expect(value.someBox).toBe(someValue);
                    expect(value.anotherBox).toBe(anotherValue);
                    expect(value.textArea).toBe(textAreaValue);
                    // doesn't find inputs in nested widgets
                    expect(Object.keys(value).length).toBe(3);
                    done();
                }, onError);
            });
        });
        it('throws an error if cacheId isn\'t defined', function () {
            expect(function () {
                var bad = new TestWidget(null);
                bad.startup();
            }).toThrowError(TestWidget.prototype.missingCacheIdError);
        });
        it('populates values if there is existing cached data', function (done) {
            var cacheId = 'testId';
            var testWidget2;
            var assert = function () {
                expect(testWidget2.someBox.value).toBe(someValue);
                expect(testWidget2.anotherBox.value).toBe(anotherValue);
                expect(testWidget2.textArea.value).toBe(textAreaValue);

                testWidget2.destroy();

                done();
            };
            var createWidget = function () {
                testWidget2 = new TestWidget({cacheId: cacheId}, domConstruct.create('div', null, document.body));
                testWidget2.startup();

                testWidget2.hydrateWithInProgressData().then(assert, onError);
            };

            localforage.setItem(cacheId, {
                someBox: someValue,
                anotherBox: anotherValue,
                textArea: textAreaValue
            }).then(createWidget, onError);
        });
    });
});
