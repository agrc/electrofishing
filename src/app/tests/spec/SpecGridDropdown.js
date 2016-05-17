require([
    'app/catch/GridDropdown',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/dom-style',
    'StubModule/StubModule',
    'dojo/Deferred'

],

function (
    GridDropdown,
    domConstruct,
    win,
    domStyle,
    stubModule,
    Deferred
    ) {
    describe('app/catch/GridDropdown', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var width = 50;
        beforeEach(function () {
            var def = new Deferred();
            var Stubbed = stubModule('app/catch/GridDropdown', {
                'app/Domains': {
                    populateSelectWithDomainValues: jasmine.createSpy('pop').andReturn(def)
                }
            });
            testWidget = new Stubbed({
                width: width
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
            def.resolve();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget.declaredClass).toEqual('app/catch/GridDropdown');
        });
        describe('_setValueAttr', function () {
            var value = 'blah';
            it('should only set the value if its not empty', function () {
                testWidget.select.value = value;
                testWidget.textBox.value = value;

                testWidget._setValueAttr('');

                expect(testWidget.textBox.value).toEqual(value);

                testWidget._setValueAttr(null);

                expect(testWidget.textBox.value).toEqual(value);
            });
            it('should set the textbox and select to the new value', function () {
                testWidget._setValueAttr(value);

                expect(testWidget.textBox.value).toEqual(value);
            });
        });
    });
});
