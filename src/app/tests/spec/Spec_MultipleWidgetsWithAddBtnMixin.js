require([
    'app/method/Equipment',
    'app/_MultipleWidgetsWithAddBtnMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/_base/declare'
],

function (
    Equipment,
    _MultipleWidgetsWithAddBtnMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    declare
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
            constructor: function () {
                console.log(this.declaredClass + '::constructor', arguments);
                if (setClass) {
                    this.AddBtnWidgetClass = Equipment;
                }
            }
        });
        var testWidget;
        beforeEach(function () {
            setClass = true;
            testWidget = new TestWidget();
            testWidget.startup();
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
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
        describe('wireEvents', function () {
            beforeEach(function () {
                spyOn(testWidget, 'addAddBtnWidget');
            });
            it('fires addAddBtnWidget when the add button is pressed on the first btn widget', function () {
                // testWidget.wireEvents();

                testWidget.addBtnWidgets[0].btn.click();

                expect(testWidget.addAddBtnWidget).toHaveBeenCalled();
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
