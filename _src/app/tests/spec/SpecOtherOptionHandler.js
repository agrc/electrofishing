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
        var options = [{
            code: 'code1',
            name: 'value1'
        }, {
            code: 'code2',
            name: 'value2'
        }, {
            code: 'code3',
            name: 'value3'
        }];
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
                var desc = 'desc';
                testWidget.codeTxt.value = value;
                testWidget.descTxt.value = desc;
                testWidget.on('add-new-value', function (event) {
                    expect(event.name).toEqual(desc);
                    expect(event.code).toEqual(value);
                    done();
                });

                testWidget.onSubmit();
            });
        });
    });
});
