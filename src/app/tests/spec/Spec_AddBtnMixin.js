require([
    'app/_AddBtnMixin',
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dojo/dom-class'
],

function (
    _AddBtnMixin,
    declare,
    _WidgetBase,
    _TemplatedMixin,
    domClass
    ) {
    describe('app/_AddBtnMixin', function () {
        var TestWidget = declare([
            _WidgetBase,
            _TemplatedMixin,
            _AddBtnMixin
        ], {
            templateString: '<div><button data-dojo-attach-point="btn"><i class="glyphicon glyphicon-plus" data-dojo-attach-point="icon"></i></div>'
        });
        var testWidget;
        beforeEach(function () {
            testWidget = new TestWidget();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(TestWidget));
        });
        describe('wireEvents', function () {
            beforeEach(function () {
                spyOn(testWidget, 'onAdd').and.callThrough();
                spyOn(testWidget, 'onRemove');
            });
            it('fires onAdd when the plus button is clicked', function () {
                testWidget.btn.click();

                expect(testWidget.onAdd).toHaveBeenCalled();
                expect(testWidget.onRemove).not.toHaveBeenCalled();
            });
            it('fires onRemove when the minus button is clicked', function () {
                testWidget.onAdd();

                testWidget.btn.click();

                expect(testWidget.onAdd.calls.count()).toBe(1);
                expect(testWidget.onRemove).toHaveBeenCalled();
            });
        });
        describe('onAdd', function () {
            it('changes to a minus button', function () {
                testWidget.onAdd();

                expect(domClass.contains(testWidget.icon, testWidget.minusIconClass)).toBe(true);
                expect(domClass.contains(testWidget.icon, testWidget.plusIconClass)).toBe(false);
            });
        });
        describe('onRemove', function () {
            it('destroys this widget', function () {
                spyOn(testWidget, 'destroyRecursive');
                testWidget.onRemove();

                expect(testWidget.destroyRecursive).toHaveBeenCalled();
            });
        });
    });
});
