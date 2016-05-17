require([
    'app/_MultipleWidgetsWithAddBtnMixin',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'app/method/CanoeBarge'

],

function (
    _MultipleWidgetsWithAddBtnMixin,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    CanoeBarge
    ) {
    describe('app/_MultipleWidgetsWithAddBtnMixin', function () {
        var setClass;
        var TestWidget = declare('TestWidget', [
            _WidgetBase,
            _TemplatedMixin,
            _WidgetsInTemplateMixin,
            _MultipleWidgetsWithAddBtnMixin
        ], {
            widgetsInTemplate: true,
            templateString: "<div><div data-dojo-attach-point='addBtnWidgetsContainer'></div></div></div>",
            constructor: function () {
                console.log(this.declaredClass + "::constructor", arguments);
                if (setClass) {
                    this.AddBtnWidgetClass = CanoeBarge;
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
            it("verifies the presence of AddBtnWidgetClass property", function () {
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
            it("fires addAddBtnWidget when the add button is pressed on the first btn widget", function () {
                // testWidget.wireEvents();

                testWidget.AddBtnWidgets[0].btn.click();

                expect(testWidget.addAddBtnWidget).toHaveBeenCalled();
            });
            it("fires onRemoveAddBtnWidget when the minus button is pressed", function () {
                spyOn(testWidget, 'onRemoveAddBtnWidget');
                testWidget.AddBtnWidgets[0].btn.click();

                testWidget.AddBtnWidgets[0].btn.click();

                expect(testWidget.addAddBtnWidget.callCount).toBe(1);
                expect(testWidget.onRemoveAddBtnWidget.callCount).toBe(1);
                expect(testWidget.onRemoveAddBtnWidget).toHaveBeenCalledWith(testWidget.AddBtnWidgets[0]);
            });
        });
        describe('addAddBtnWidget', function () {
            it("create a new Backpack widget", function () {
                testWidget.addAddBtnWidget();

                expect(testWidget.AddBtnWidgets.length).toEqual(2);
            });
            it("wires onAdd for the newly created widget", function () {
                spyOn(testWidget, 'addAddBtnWidget').andCallThrough();
                testWidget.addAddBtnWidget();

                testWidget.AddBtnWidgets[1].btn.click();

                expect(testWidget.addAddBtnWidget.calls.length).toEqual(2);
            });
        });
        describe('onRemoveAddBtnWidget', function () {
            it("removes the widget from AddBtnWidgets array", function () {
                testWidget.addAddBtnWidget();
                var newWidget = testWidget.AddBtnWidgets[1];
                testWidget.addAddBtnWidget();
                testWidget.onRemoveAddBtnWidget(newWidget);

                expect(testWidget.AddBtnWidgets).not.toContain(newWidget);
            });
        });
    });
});