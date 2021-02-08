require([
    'react-app/config',
    'app/StreamSearch',

    'dojo/dom-construct',
    'dojo/_base/window'
], function (
    config,
    StreamSearch,

    domConstruct,
    win
) {
    // TODO: remove once this module is converted to a component
    config = config.default;

    describe('app/StreamSearch', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new StreamSearch({
                map: new L.Map(domConstruct.create('div')),
                searchField: 'SearchField'
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(StreamSearch));
        });

        describe('_processResults', function () {
            var featureSets = [
                {features: [{attributes: {SearchField: 1}}, {attributes: {SearchField: 2}}]},
                {features: [{attributes: {SearchField: 3}}, {attributes: {SearchField: 4}}]}
            ];

            beforeEach(function () {
                spyOn(testWidget, '_populateTable');
            });
            it('combines the features from both sets', function () {
                testWidget._processResults(featureSets);

                expect(testWidget._populateTable.calls.mostRecent().args[0].length).toBe(4);
            });
            it('adds a reference to the source layer for each feature', function () {
                testWidget._processResults(featureSets);

                expect(testWidget._populateTable.calls.mostRecent().args[0][0].queryUrl)
                    .toMatch(config.urls.streamsFeatureService);
            });
        });
    });
});
