require([
    'app/OtherOptionHandler',

    'dojo/_base/window',

    'dojo/dom-construct',

    'app/Domains'
], function(
    OtherOptionHandler,

    win,

    domConstruct,

    Domains
) {
    describe('app/OtherOptionHandler', function() {
        var testWidget;
        var destroy = function(widget) {
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
        beforeEach(function() {
            select = domConstruct.create('select', {}, win.body());
            Domains.buildOptions(options, select);
            testWidget = new OtherOptionHandler({
                select: select,
                otherTxt: Domains.otherTxt
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function() {
            destroy(testWidget);
            domConstruct.destroy(select);
        });
        it('create a valid object', function() {
            expect(testWidget).toEqual(jasmine.any(OtherOptionHandler));
        });
        describe('postCreate', function () {
            it('creates the existing options list', function () {
                expect(testWidget.existingOptionsList.children.length).toBe(options.length);
            });
        });
        describe('onSubmit', function () {
            it('adds the option to the select', function () {
                var value = 'blah3';
                var desc = 'desc';
                testWidget.codeTxt.value = value;
                testWidget.descTxt.value = desc;
                testWidget.onSubmit();

                expect(select.children[select.children.length - 1].value).toEqual(value);
                expect(select.value).toEqual(value);
            });
        });
    });
});