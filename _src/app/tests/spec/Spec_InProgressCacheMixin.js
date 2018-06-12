require([
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
        var selectValue = 'two';
        var selectNoOptionsValue = 'temp';
        var onError = function (error) {
            console.error(error);
        };

        beforeEach(function (done) {
            localforage.clear().then(function () {
                testWidget = new TestWidget({
                    cacheId: 'TestWidget',
                    cachePrefix: 'jasmine',
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
            testWidget.select.value = selectValue;

            testWidget.cacheInProgressData().then(function () {
                localforage.getItem(`${testWidget.cachePrefix}_${testWidget.cacheId}`).then(function (value) {
                    expect(value.someBox).toBe(someValue);
                    expect(value.anotherBox).toBe(anotherValue);
                    expect(value.textArea).toBe(textAreaValue);
                    expect(value.select).toBe(selectValue);
                    // doesn't find inputs in nested widgets
                    expect(Object.keys(value).length).toBe(5);
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
            var cachePrefix = 'jasmine';
            var testWidget2;
            var assert = function () {
                expect(testWidget2.someBox.value).toBe(someValue);
                expect(testWidget2.anotherBox.value).toBe(anotherValue);
                expect(testWidget2.textArea.value).toBe(textAreaValue);
                expect(testWidget2.select.value).toBe(selectValue);
                expect(testWidget2.selectNoOptions.dataset.tempValue).toBe(selectNoOptionsValue);

                testWidget2.destroy();

                done();
            };
            var createWidget = function () {
                testWidget2 = new TestWidget({
                    cacheId,
                    cachePrefix
                }, domConstruct.create('div', null, document.body));
                testWidget2.startup();

                testWidget2.hydrateWithInProgressData().then(assert, onError);
            };

            localforage.setItem(`${cachePrefix}_${cacheId}`, {
                someBox: someValue,
                anotherBox: anotherValue,
                textArea: textAreaValue,
                select: selectValue,
                selectNoOptions: selectNoOptionsValue
            }).then(createWidget, onError);
        });
        it('mixes in additional data to be cached from getAdditionalCacheData', function () {
            var value = 'blah';
            testWidget.getAdditionalCacheData = function () {
                return {value: value};
            };

            spyOn(localforage, 'setItem').and.callThrough();

            testWidget.cacheInProgressData();

            expect(localforage.setItem.calls.mostRecent().args[1]).toEqual({
                someBox: '',
                anotherBox: '',
                textArea: '',
                select: 'one',
                selectNoOptions: '',
                value: value
            });
        });
    });
});
