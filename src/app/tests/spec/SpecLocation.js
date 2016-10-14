require([
    'app/config',
    'app/location/Location',

    'dojo/Deferred',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/topic',
    'dojo/_base/window'
], function (
    config,
    Location,

    Deferred,
    domClass,
    domConstruct,
    topic,
    win
) {
    describe('app/location/Location', function () {
        var testWidget;
        beforeEach(function () {
            config.app = {};
            testWidget = new Location(null, domConstruct.create('div', null, win.body()));
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        describe('constructor', function () {
            it('should create a valid widget', function () {
                expect(testWidget).toEqual(jasmine.any(Location));
            });
        });
        describe('wireEvents', function () {
            beforeEach(function () {
                spyOn(testWidget.verifyMap, 'initMap');
            });
            it('subscribe to onDistanceChange and update the stream length field', function () {
                var dist = '500';
                topic.publish(config.topics.startDistDirGeoDef_onDistanceChange, dist);

                expect(testWidget.streamLengthTxt.value).toEqual(dist);
            });
            it('inits the map', function () {
                topic.publish(config.topics.newCollectionEvent);

                expect(testWidget.verifyMap.initMap).toHaveBeenCalled();
            });
            it('doesnt init the map twice', function () {
                testWidget.verifyMap.map = {remove: function () {}};

                topic.publish(config.topics.newCollectionEvent);

                expect(testWidget.verifyMap.initMap).not.toHaveBeenCalled();
            });
        });
        describe('validateGeometry', function () {
            it('calls getGeometry on the current GeoDef', function () {
                var fakeDef = {then: function () {}};
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue(fakeDef);

                testWidget.validateGeometry();

                expect(testWidget.currentGeoDef.getGeometry).toHaveBeenCalled();
            });
            it('toggles the loading button', function (done) {
                // have to test asnyc because of bootstrap plugin using setTimeout
                var def;
                def = new Deferred();
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue(def);

                testWidget.validateGeometry();

                setTimeout(function () {
                    expect(domClass.contains(testWidget.verifyMapBtn, 'disabled')).toBe(true);
                    expect(testWidget.verifyMapBtn.disabled).toBe(true);

                    def.resolve(true);
                    setTimeout(function () {
                        expect(testWidget.verifyMapBtn.innerHTML).toEqual(testWidget.successfullyVerifiedMsg);
                        expect(testWidget.verifyMapBtn.disabled).toBe(true);

                        done();
                    }, 100);
                }, 100);
            });
            it('calls setValidateMsg if getGeometry returns a string', function () {
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue('blah');
                spyOn(testWidget, 'setValidateMsg');

                testWidget.validateGeometry();

                expect(testWidget.setValidateMsg).toHaveBeenCalledWith('blah');
            });
            it('clears the validateMsg if getGeometry returns a def', function () {
                var fakeDef = {then: function () {}};
                testWidget.validateMsg.innerHTML = 'blah';
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue(fakeDef);

                testWidget.validateGeometry();

                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
            it('sets geometry property if getGeometry def resolves successfully', function () {
                var def = new Deferred();
                testWidget.verifyMap.initMap();
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue(def);
                var value = {
                    path: [[[40.61961708800004,-111.77570324799996],[40.61949659800007,-111.77589739899997],[40.619351764000044,-111.77616160999997],[40.61931103200004,-111.77619033999997],[40.61898055900008,-111.77642319899996],[40.618710168000064,-111.77676409899999],[40.61852672800006,-111.77745015199997],[40.61844689000003,-111.77780117599997],[40.618263324000054,-111.77851843299999],[40.61826179600007,-111.77874516599996],[40.61829342500005,-111.77910445799995],[40.618347689000075,-111.77944698899995],[40.61837832700007,-111.77995274799997],[40.618404905000034,-111.78020581799996],[40.61839656800004,-111.78059963999999]]],
                    utm: {}
                };
                testWidget.validateGeometry();

                def.resolve(value);

                expect(testWidget.geometry).toEqual(jasmine.anything());
                expect(testWidget.utmGeo).not.toBeNull();
            });
            it('clears the geometry property if getGeometry isnt successful', function () {
                spyOn(testWidget.currentGeoDef, 'getGeometry').and.returnValue('blah');
                testWidget.verifyMap.initMap();
                testWidget.geometry = 'hello';

                testWidget.validateGeometry();

                expect(testWidget.geometry).toBeNull();
            });
        });
        describe('setValidateMsg', function () {
            it('sets the text of span:validateMsg', function () {
                var value = 'blah';

                testWidget.setValidateMsg(value);

                expect(testWidget.validateMsg.innerHTML).toBe(value);
            });
        });
        describe('clearValidation', function () {
            it('resets the button and clears any validation messages', function () {
                domClass.add(testWidget.verifyMapBtn, 'disabled');
                testWidget.validateMsg.innerHTML = 'blah';

                testWidget.clearValidation();

                expect(domClass.contains(testWidget.verifyMapBtn, 'disabled')).toBe(true);
                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
            it('removes the polyline from the map', function () {
                spyOn(testWidget, 'clearGeometry');

                testWidget.clearValidation();

                expect(testWidget.clearGeometry).toHaveBeenCalled();
            });
        });
        describe('onGeoDefChange', function () {
            var evt;
            beforeEach(function () {
                evt = {
                    target: {
                        id: 'blah'
                    }
                };
            });
            it('calls clearValidation', function () {
                spyOn(testWidget, 'clearValidation');

                testWidget.onGeoDefChange(evt);

                expect(testWidget.clearValidation).toHaveBeenCalled();
            });
        });
        describe('clearGeometry', function () {
            it('removes the geometry from the map if it exists', function () {
                var value = true;
                testWidget.verifyMap.initMap();
                spyOn(config.app.map, 'removeLayer');

                testWidget.clearGeometry();

                expect(config.app.map.removeLayer).not.toHaveBeenCalled();

                testWidget.geometry = value;

                testWidget.clearGeometry();

                expect(config.app.map.removeLayer).toHaveBeenCalledWith(value);
                expect(testWidget.geometry).toBeNull();
            });
        });
        describe('hasValidLocation', function () {
            var s = 'blah';
            it('returns true if all values are valid', function () {
                testWidget.geometry = {};
                domConstruct.create('option', {
                    innerHTML: s,
                    value: s
                }, testWidget.station.stationTxt);
                $(testWidget.station.stationTxt).combobox('refresh');
                testWidget.station.stationTxt.value = s;
                testWidget.streamLengthTxt.value = 500;
                testWidget.dateTxt = '01/20/1980';

                expect(testWidget.hasValidLocation()).toBe(true);
            });
            it('returns invalid string if no geometry object', function () {
                expect(testWidget.hasValidLocation()).toEqual(testWidget.invalidLocationMsg);
            });
            it('returns invalid string if no station', function () {
                testWidget.geometry = {};

                expect(testWidget.hasValidLocation()).toEqual(testWidget.invalidStationMsg);
            });
            it('returns invalid string if no stream length', function () {
                testWidget.geometry = {};
                domConstruct.create('option', {
                    innerHTML: s,
                    value: s
                }, testWidget.station.stationTxt);
                $(testWidget.station.stationTxt).combobox('refresh');
                testWidget.station.stationTxt.value = s;

                expect(testWidget.hasValidLocation()).toEqual(testWidget.invalidStreamLength);
            });
        });
        describe('clear', function () {
            it('calls the appropriate functions', function () {
                spyOn(testWidget, 'clearValidation');
                spyOn(testWidget.station, 'clear');
                spyOn(testWidget.currentGeoDef, 'clearGeometry');

                testWidget.clear();

                expect(testWidget.clearValidation).toHaveBeenCalled();
                expect(testWidget.station.clear).toHaveBeenCalled();
                expect(testWidget.currentGeoDef.clearGeometry).toHaveBeenCalled();
            });
            it('clears the stream length and location fields', function () {
                testWidget.streamLengthTxt.value = 300;
                testWidget.additionalNotesTxt.value = 'blah';
                testWidget.dateTxt.value = '01/20/1980';
                spyOn(testWidget.station, 'clear');

                testWidget.clear();

                expect(testWidget.streamLengthTxt.value).toEqual('');
                expect(testWidget.additionalNotesTxt.value).toEqual('');
                expect(testWidget.dateTxt.value).toEqual('');
                expect(testWidget.station.clear).toHaveBeenCalled();
            });
        });
    });
});
