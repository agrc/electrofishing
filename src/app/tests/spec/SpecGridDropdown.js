require([
    'app/catch/GridDropdown',

    'dojo/Deferred',
    'dojo/dom-construct',
    'dojo/dom-style',

    'stubmodule'
],

function (
    GridDropdown,

    Deferred,
    domConstruct,
    domStyle,

    stubModule
) {
    describe('app/catch/GridDropdown', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var width = 50;
        var Stubbed;
        beforeEach(function (done) {
            var def = new Deferred();
            stubModule('app/catch/GridDropdown', {
                'app/Domains': {
                    populateSelectWithDomainValues: jasmine.createSpy('pop').and.returnValue(def)
                }
            }).then(function (StubbedModule) {
                Stubbed = StubbedModule;
                testWidget = new StubbedModule({
                    width: width
                }, domConstruct.create('div', {}, document.body));
                testWidget.startup();
                def.resolve();
                done();
            });
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Stubbed));
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
