require([
    'react-app/config',
    'app/location/StartDistDirGeoDef',

    'dojo/Deferred',
    'dojo/dom-class',
    'dojo/json',
    'dojo/on',
    'pubsub-js'
], function (
    config,
    StartDistDirGeoDef,

    Deferred,
    domClass,
    json,
    on,
    topic
) {
    // TODO: remove once this module is converted to a component
    config = config.default;

    describe('app/location/StartDistDirGeoDef', function () {
        var testWidget;
        beforeEach(function () {
            config.app = {map: {addLayer: function () {}}};
            testWidget = new StartDistDirGeoDef();
        });
        afterEach(function () {
            testWidget = null;
        });

        describe('constructor', function () {
            it('creates a valid object', function () {
                expect(testWidget).toEqual(jasmine.any(StartDistDirGeoDef));
            });
        });
        describe('postCreate', function () {
            it('sets the defs property', function () {
                expect(testWidget.defs[0]).toBe(testWidget.startPointDef);
            });
        });
        describe('wireEvents', function () {
            it('subscribes to the mapInit topic and creates a feature group', function () {
                spyOn(testWidget.startPointDef, 'setMap');

                topic.publishSync(config.topics.mapInit);

                expect(testWidget.featureGroup).toBeDefined();
                expect(testWidget.startPointDef.setMap).toHaveBeenCalled();
            });
            it('wires onInvalidate to direction buttons', function () {
                spyOn(testWidget, 'onInvalidate');

                testWidget.downBtn.click();
                testWidget.upBtn.click();

                expect(testWidget.onInvalidate.calls.count()).toEqual(2);
            });
            it('wires onInvalidate to distanceBox on change', function () {
                spyOn(testWidget, 'onInvalidate');
                spyOn(testWidget.startPointDef, 'updateMarkerPosition');

                testWidget.wireEvents();
                on.emit(testWidget.distanceBox, 'change', {bubbles: false});

                expect(testWidget.onInvalidate).toHaveBeenCalled();
            });
        });
        describe('getGeometry', function () {
            it('return a dojo.Deferred object if is has valid start point and distance', function () {
                spyOn(testWidget.startPointDef, 'getPoint').and.returnValue({});
                spyOn(testWidget, 'getDistance').and.returnValue(123);

                expect(testWidget.getGeometry()).toEqual(jasmine.any(Deferred));
            });
            it('returns an invalid message it if doesnt have valid start point and/or distance', function () {
                expect(testWidget.getGeometry()).toBe(testWidget.invalidStartMsg);

                spyOn(testWidget.startPointDef, 'getPoint').and.returnValue({});

                expect(testWidget.getGeometry()).toBe(testWidget.invalidDistanceMsg);
            });
            it('calls getXHRParams', function () {
                spyOn(testWidget, 'getXHRParams');
                spyOn(testWidget.startPointDef, 'getPoint').and.returnValue({});
                spyOn(testWidget, 'getDistance').and.returnValue(123);

                testWidget.getGeometry();

                expect(testWidget.getXHRParams).toHaveBeenCalledWith({}, 123, 'up');
            });
            it('sets the geoDef property', function () {
                var start = {x: 1, y: 2};
                spyOn(testWidget.startPointDef, 'getPoint').and.returnValue(start);
                var dist = 3;
                spyOn(testWidget, 'getDistance').and.returnValue(dist);
                var dir = 'blah';
                spyOn(testWidget, 'getDirection').and.returnValue(dir);

                testWidget.getGeometry();

                expect(testWidget.geoDef).toEqual('start:' + json.stringify(start) + '|dist:' + dist + '|dir:' + dir);
            });
        });
        describe('getDistance', function () {
            it('returns the value form the distance text box', function () {
                var value = '123';
                testWidget.distanceBox.value = value;

                expect(testWidget.getDistance()).toEqual(value);
            });
            it('returns null if the text box is empty', function () {
                expect(testWidget.getDistance()).toBeNull();
            });
            it('publishes the streamDistance topic', function () {
                var value = '500';
                var publishedValue;
                topic.subscribe(config.topics.startDistDirGeoDef_onDistanceChange, function (_, dist) {
                    publishedValue = dist;
                });

                testWidget.getDistance();

                expect(publishedValue).toEqual('');

                testWidget.distanceBox.value = value;
                testWidget.getDistance();

                expect(publishedValue).toEqual(value);
            });
        });
        describe('getDirection', function () {
            it('returns up or down corresponding to the selected button', function () {
                domClass.remove(testWidget.downBtn, 'active');
                domClass.add(testWidget.upBtn, 'active');

                expect(testWidget.getDirection()).toEqual('up');

                domClass.remove(testWidget.upBtn, 'active');
                domClass.add(testWidget.downBtn, 'active');

                expect(testWidget.getDirection()).toEqual('down');
            });
        });
        describe('getXHRParams', function () {
            it('sets the appropriate values', function () {
                var distance = 123;
                var direction = 'up';
                var value = testWidget.getXHRParams({x: 1.1, y: 2.2}, distance, direction);
                var geo = json.parse(value.query.point).features[0].geometry;

                expect(geo.x).toEqual(1);
                expect(geo.y).toEqual(2);
                expect(value.query.distance).toEqual(distance);
                expect(value.query.direction).toEqual(direction);
            });
        });
    });
});
