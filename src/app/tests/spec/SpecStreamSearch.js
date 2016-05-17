require([
    'app/StreamSearch',
    'dojo/dom-construct',
    'dojo/_base/window'

],

function (
    StreamSearch,
    domConstruct,
    win
    ) {
    describe('app/StreamSearch', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new StreamSearch({
                map: new L.Map(domConstruct.create('div'))
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(StreamSearch));
        });
    });
});