require([
    'app/SummaryReport',

    'dojo/dom-construct',
    'dojo/text!../../../../scripts/Scripts/TestData/NewCollectionEventData.json'
], function (
    WidgetUnderTest,

    domConstruct,
    reportDataJSON
) {
    describe('app/SummaryReport', function () {
        var widget;
        var destroy = function (destroyWidget) {
            destroyWidget.destroyRecursive();
            destroyWidget = null;
        };

        beforeEach(function () {
            widget = new WidgetUnderTest(null, domConstruct.create('div', null, document.body));
            widget.startup();
        });

        afterEach(function () {
            if (widget) {
                destroy(widget);
            }
        });

        describe('Sanity', function () {
            it('should create a SummaryReport', function () {
                expect(widget).toEqual(jasmine.any(WidgetUnderTest));
            });
        });

        describe('displayReport', function () {
            it('generates the correct summary object', function () {
                var data = widget.displayReport(JSON.parse(reportDataJSON));

                expect(data.passes.length).toBe(2);
                expect(data.passes[0].name).toBe('1');
                expect(data.passes[0].species.length).toBe(2);
                expect(data.passes[0].species[0].name).toBe('BS');
                expect(data.passes[0].species[0].count).toBe(2);
                expect(data.passes[0].species[1].count).toBe(1);
            });
        });
    });
});
