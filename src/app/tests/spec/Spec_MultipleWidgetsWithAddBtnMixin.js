require([
    'app/method/Equipment',
    'app/_MultipleWidgetsWithAddBtnMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare',

    'localforage'
], function (
    Equipment,
    _MultipleWidgetsWithAddBtnMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    declare,

    localforage
) {
    describe('app/_MultipleWidgetsWithAddBtnMixin', function () {
        var setClass;
        var TestWidget = declare([
            _WidgetBase,
            _TemplatedMixin,
            _WidgetsInTemplateMixin,
            _MultipleWidgetsWithAddBtnMixin
        ], {
            widgetsInTemplate: true,
            templateString: '<div><div data-dojo-attach-point="addBtnWidgetsContainer"></div></div></div>',
            cacheId: 'test/widget',
            constructor: function () {
                console.log(this.declaredClass + '::constructor', arguments);
                if (setClass) {
                    this.AddBtnWidgetClass = Equipment;
                }
            }
        });
        var testWidget;
        beforeEach(function (done) {
            localforage.clear().then(function () {
                setClass = true;
                testWidget = new TestWidget();
                testWidget.startup();
                testWidget.promise.then(done);
            });
        });
        afterEach(function (done) {
            testWidget.destroy();
            testWidget = null;
            localforage.clear().then(done);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(TestWidget));
        });
        describe('postCreate', function () {
            it('verifies the presence of AddBtnWidgetClass property', function () {
                setClass = false;
                expect(function () {
                    new TestWidget();
                }).toThrow(testWidget.noAddBtnWidgetPropErrMsg);
            });
        });
        describe('initChildWidgets', function () {
            it('creates multiple existing widgets if there is cached in progress data', function (done) {
                localforage.setItem(TestWidget.prototype.cacheId, 3).then(function () {
                    testWidget.addBtnWidgets = [];

                    testWidget.initChildWidgets().then(function () {
                        expect(testWidget.addBtnWidgets.length).toBe(3);

                        done();
                    });
                });
            });
        });
        describe('wireEvents', function () {
            beforeEach(function () {
                spyOn(testWidget, 'addAddBtnWidget').and.callThrough();
            });
            it('fires addAddBtnWidget when the add button is pressed on the first btn widget', function () {
                testWidget.addBtnWidgets[0].btn.click();

                expect(testWidget.addAddBtnWidget.calls.count()).toBe(1);
            });
            it('fires onRemoveAddBtnWidget when the minus button is pressed', function () {
                spyOn(testWidget, 'onRemoveAddBtnWidget');
                testWidget.addBtnWidgets[0].btn.click();

                testWidget.addBtnWidgets[0].btn.click();

                expect(testWidget.addAddBtnWidget.calls.count()).toBe(1);
                expect(testWidget.onRemoveAddBtnWidget.calls.count()).toBe(1);
                expect(testWidget.onRemoveAddBtnWidget).toHaveBeenCalledWith(testWidget.addBtnWidgets[0]);
            });
        });
        describe('addAddBtnWidget', function () {
            it('create a new Equipment widget', function () {
                testWidget.addAddBtnWidget();

                expect(testWidget.addBtnWidgets.length).toEqual(2);
            });
            it('wires onAdd for the newly created widget', function () {
                spyOn(testWidget, 'addAddBtnWidget').and.callThrough();
                testWidget.addAddBtnWidget();

                testWidget.addBtnWidgets[1].btn.click();

                expect(testWidget.addAddBtnWidget.calls.count()).toEqual(2);
            });
        });
        describe('onRemoveAddBtnWidget', function () {
            it('removes the widget from addBtnWidgets array', function () {
                testWidget.addAddBtnWidget();
                var newWidget = testWidget.addBtnWidgets[1];
                testWidget.addAddBtnWidget();
                testWidget.onRemoveAddBtnWidget(newWidget);

                expect(testWidget.addBtnWidgets).not.toContain(newWidget);
            });
        });
    });
});
