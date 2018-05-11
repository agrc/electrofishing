require([
    'app/Domains',
    'app/OtherOptionHandler',

    'dojo/dom-construct',
    'dojo/_base/window'
], function (
    Domains,
    OtherOptionHandler,

    domConstruct,
    win
) {
    describe('app/OtherOptionHandler', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var select;
        const code1 = 'code1';
        var options = [code1, 'code2', 'code3'];

        beforeEach(function () {
            select = domConstruct.create('select', {}, win.body());
            Domains.buildOptions(options, select);
            testWidget = new OtherOptionHandler({
                existingOptions: options,
                otherTxt: Domains.otherTxt
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });

        afterEach(function () {
            destroy(testWidget);
            domConstruct.destroy(select);
        });

        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(OtherOptionHandler));
        });

        describe('postCreate', function () {
            it('creates the existing options list', function () {
                expect(testWidget.existingOptionsList.children.length).toBe(options.length);
            });
        });

        describe('onSubmit', function () {
            it('emits the new option', function (done) {
                var value = 'blah3';
                testWidget.codeTxt.value = value;
                testWidget.on('add-new-value', function (event) {
                    expect(event.code).toEqual(value);
                    done();
                });

                testWidget.onSubmit();
            });
        });

        describe('onTxtChange', function () {
            it('does not allow for an existing value to be submitted', function () {
                testWidget.codeTxt.value = code1.toUpperCase();

                testWidget.onTxtChange({});

                expect(testWidget.submitBtn.disabled).toBe(true);
            });
        });
    });
});
