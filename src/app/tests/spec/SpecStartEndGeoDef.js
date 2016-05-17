require([
    'app/location/StartEndGeoDef',
    'dojo/Deferred',
    'dojo/json',
    'dojo/topic',
    'StubModule/StubModule'
],

function (
    StartEndGeoDef,
    Deferred,
    json,
    topic,
    stubModule
    ) {
    describe('app/location/StartEndGeoDef', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new StartEndGeoDef();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(StartEndGeoDef));
        });
        describe('postCreate', function () {
            it('stores point defs in defs property', function () {
                expect(testWidget.defs).toEqual([testWidget.startPointDef, testWidget.endPointDef]);
            });
        });
        describe('wireEvents', function () {
            it('wires the onInvalidate method to point defs', function () {
                spyOn(testWidget, 'onInvalidate');
                spyOn(testWidget.startPointDef, 'updateMarkerPosition');
                spyOn(testWidget.endPointDef, 'updateMarkerPosition');

                testWidget.wireEvents();
                testWidget.startPointDef.updateMarkerPosition();
                testWidget.endPointDef.updateMarkerPosition();

                expect(testWidget.onInvalidate.calls.length).toEqual(2);
            });
            it('subscribes to the mapInit topic and creates a feature group', function () {
                spyOn(testWidget.startPointDef, 'setMap');
                spyOn(testWidget.endPointDef, 'setMap');

                topic.publish(AGRC.topics.mapInit);

                expect(testWidget.featureGroup).toBeDefined();
                expect(testWidget.startPointDef.setMap).toHaveBeenCalled();
                expect(testWidget.endPointDef.setMap).toHaveBeenCalled();
            });
        });
        describe('getGeometry', function () {
            it('return a dojo.Deferred object if it has valid geometries', function () {
                spyOn(testWidget.startPointDef, 'getPoint').andReturn({});
                spyOn(testWidget.endPointDef, 'getPoint').andReturn({});

                expect(testWidget.getGeometry()).toEqual(jasmine.any(Deferred));
            });
            it('should return an invalid message if it doesnt have valid geometries', function () {
                expect(testWidget.getGeometry()).toBe(testWidget.invalidStartMsg);

                spyOn(testWidget.startPointDef, 'getPoint').andReturn({});

                expect(testWidget.getGeometry()).toBe(testWidget.invalidEndMsg);
            });
            it('calls getXHRParams', function () {
                spyOn(testWidget, 'getXHRParams');
                var start = {};
                var end = {};
                spyOn(testWidget.startPointDef, 'getPoint').andReturn(start);
                spyOn(testWidget.endPointDef, 'getPoint').andReturn(end);

                testWidget.getGeometry();

                expect(testWidget.getXHRParams).toHaveBeenCalledWith(start, end);
            });
            it('sets the geoDef property', function () {
                var start = {x: 1, y: 2};
                spyOn(testWidget.startPointDef, 'getPoint').andReturn(start);
                var end = {x: 3, y: 4};
                spyOn(testWidget.endPointDef, 'getPoint').andReturn(end);

                testWidget.getGeometry();

                expect(testWidget.geoDef).toEqual('start:' + json.stringify(start) + '|end:' + json.stringify(end));
            });
        });
        describe('getXHRParams', function () {
            it('rounds the x and y coords', function () {
                var start = {x: 1.1, y: 2.1};
                var end = {x: 3.1, y: 4.1};

                var points = json.parse(testWidget.getXHRParams(start, end).query.points);

                expect(points.features[0].geometry.x).toEqual(1);
                expect(points.features[0].geometry.y).toEqual(2);
                expect(points.features[1].geometry.x).toEqual(3);
                expect(points.features[1].geometry.y).toEqual(4);
            });
        });
        describe('onGetSegsCallback', function () {
            it('returns false if there was an error', function () {
                expect(testWidget.onGetSegsCallback({error: {message: 'blah'}}))
                    .toBe(false);
            });
            it('calls setInterval', function () {
                spyOn(window, 'setInterval');

                testWidget.onGetSegsCallback({});

                expect(window.setInterval).toHaveBeenCalled();
            });
            it('calls checkJobStatus', function () {
                spyOn(testWidget, 'checkJobStatus').andReturn(true);

                runs(function () {
                    testWidget.onGetSegsCallback({});
                });
                waitsFor(function () {
                    return testWidget.checkJobStatus.calls.length > 0;
                }, 'checkJobStatus to be called', 1500);
            });
            it('returns true if there wasnt an error', function () {
                expect(testWidget.onGetSegsCallback({})).toBe(true);
            });
        });
        describe('checkJobStatus', function () {
            var xhrDef;
            var def;
            var xhrSpy;
            var testWidget2;
            beforeEach(function () {
                xhrDef = new Deferred();
                def = new Deferred();
                xhrSpy = jasmine.createSpy('xhr').andReturn(xhrDef);
                var StartEndGeoDef2 = stubModule('app/location/StartEndGeoDef', {
                    'dojo/request/xhr': xhrSpy
                }, ['app/location/_GeoDefMixin']);
                testWidget2 = new StartEndGeoDef2();
                spyOn(testWidget2, 'getJobResults');
            });
            afterEach(function () {
                xhrDef = null;
                def = null;
                xhrSpy = null;
                testWidget2 = null;
            });
            it('calls getResult and returns true if esriJobSucceeded', function () {
                testWidget2.checkJobStatus('123', def);
                xhrDef.resolve({jobStatus: 'esriJobSucceeded'});

                expect(xhrSpy).toHaveBeenCalled();
                expect(testWidget2.getJobResults).toHaveBeenCalled();
            });
            // not sure why these two tests won't pass if they are on at the same time?
            it('rejects the def if job fails', function () {
                spyOn(def, 'reject');

                testWidget2.checkJobStatus('123', def);
                xhrDef.resolve({jobStatus: 'esriJobFailed'});

                expect(def.reject).toHaveBeenCalled();
                expect(testWidget2.getJobResults).not.toHaveBeenCalled();
            });
        });
    });
});
