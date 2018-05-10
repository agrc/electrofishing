require([
    'app/config',
    'app/location/VerifyMap',

    'dojo/dom-construct',
    'dojo/dom-style',
    'dojo/topic',
    'dojo/_base/window'
], function (
    config,
    VerifyMap,

    domConstruct,
    domStyle,
    topic,
    win
) {
    describe('app/location/VerifyMap', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new VerifyMap(null, domConstruct.create('div', null, win.body()));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        describe('postCreate', function () {
            it('should call initMap only if its not the main map', function () {
                spyOn(testWidget, 'initMap');

                testWidget.postCreate();

                expect(testWidget.initMap).toHaveBeenCalled();

                testWidget.isMainMap = true;
                testWidget.postCreate();

                expect(testWidget.initMap.calls.count()).toBe(1);
            });
            it('creates the selectedIcon', function () {
                expect(testWidget.selectedIcon).toBeDefined();
            });
        });
        describe('initMap', function () {
            var fired;
            beforeEach(function () {
                fired = false;
                topic.subscribe(config.topics.mapInit, function () {
                    fired = true;
                });
                config.app = { map: undefined };
            });
            it('should create a valid map', function () {
                expect(testWidget.map).toBeDefined();
            });
            it('sets the config.app.map and fires global topic only if isMainMap = true', function () {
                var testWidget2 = new VerifyMap(
                    { isMainMap: true }, domConstruct.create('div', null, win.body()));
                testWidget2.initMap();

                expect(config.app.map).toBe(testWidget2.map);
                expect(fired).toBe(true);

                testWidget2.destroy();
            });
            it('doesn\'t set config.app.map and fire the global topic if isMainMap = false', function () {
                var testWidget2 = new VerifyMap({ isMainMap: false });

                expect(config.app.map).toBeUndefined();
                expect(fired).toBe(false);

                testWidget2.destroy();
            });
        });
        describe('clearSelection', function () {
            it('clears startSelectedId', function () {
                testWidget.startSelectedId = 'blah';

                testWidget.clearSelection();

                expect(testWidget.startSelectedId).toBeUndefined();
            });
            it('loops through all of the markers and resets their icon', function () {
                spyOn(testWidget.stationsLyr, 'eachFeature');

                testWidget.clearSelection();

                expect(testWidget.stationsLyr.eachFeature).toHaveBeenCalled();
            });
        });
    });
});
