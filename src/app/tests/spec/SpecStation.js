require([
    'app/location/Station',
    'dojo/dom-construct',
    'dojo/dom-class',
    'dojo/dom-style',
    'stubmodule',
    'dojo/topic'
],

function (
    Station,
    domConstruct,
    domClass,
    domStyle,
    stubModule,
    topic
    ) {
    describe('app/location/Station', function () {
        var testWidget;
        var point;
        beforeEach(function () {
            AGRC.app = {map: {
                options: {crs: {projection: {unproject: function () {}}}},
                setView: function () {}
            }};
            point = {x: 428861, y: 4496470};
            testWidget = new Station();
            testWidget.mainMap = {
                stationsLyr: {
                    on: function () {},
                    off: function () {}
                },
                map: {
                    setView: function () {}
                },
                selectStation: function () {},
                clearSelection: function () {}
            };
        });
        afterEach(function () {
            testWidget.destroy();
            testWidget = null;
        });
        describe('constructor', function () {
            it('create a valid object', function () {
                expect(testWidget).toEqual(jasmine.any(Station));
            });
        });
        describe('postCreate', function () {
            it('fires wireEvents', function () {
                spyOn(testWidget, 'wireEvents');

                testWidget.postCreate();

                expect(testWidget.wireEvents).toHaveBeenCalled();
            });
        });
        describe('wireEvents', function () {
            it('wires onDialogShown', function () {
                spyOn(testWidget, 'onDialogShown');

                $(testWidget.stationDialog).trigger('shown');

                expect(testWidget.onDialogShown).toHaveBeenCalled();
            });
            it('wires the onSubmit function', function () {
                spyOn(testWidget, 'onSubmit');

                testWidget.submitBtn.click();

                expect(testWidget.onSubmit).toHaveBeenCalled();
            });
            it('listens for the station click topic and sets station text box', function () {
                var value = 'blah';
                testWidget.stations = [value];

                topic.publish(AGRC.topics.onStationClick, [value]);

                expect(testWidget.stationTxt.value).toEqual(value);
            });
        });
        // broken somewhere in stub module
        xdescribe('onDialogShown', function () {
            it('inits the map if it hasn\'t been done already', function () {
                var VerifyMapSpy = jasmine.createSpy('VerifyMapSpy').and.returnValue({
                    map: {
                        addLayer: function () {}
                    }
                });
                var Stubbed = stubModule('app/location/Station', {
                    'app/location/VerifyMap': VerifyMapSpy

                    // // this helps with an error with StubModule
                    // 'dojo/request/xhr': {get: function () {return {then: function () {}};}}
                });
                var testWidget2 = new Stubbed();
                spyOn(testWidget2.pointDef, 'setMap');

                testWidget2.onDialogShown();
                testWidget2.onDialogShown();

                expect(VerifyMapSpy.calls.count()).toEqual(1);
                expect(testWidget2.pointDef.setMap.calls.count()).toEqual(1);
                expect(testWidget2.fGroup).toEqual(jasmine.any(L.FeatureGroup));

                testWidget2.destroy();
            });
        });
        describe('clear', function () {
            it('clears the textbox', function () {
                testWidget.stationTxt.value = 'blah';

                testWidget.clear();

                expect(testWidget.stationTxt.value).toEqual('');
            });
            it('calls clearSelection on verify map', function () {
                spyOn(testWidget.mainMap, 'clearSelection');

                testWidget.clear();

                expect(testWidget.mainMap.clearSelection).toHaveBeenCalled();
            });
        });
        describe('onSubmit', function () {
            var feature;
            beforeEach(function () {
                feature = {attributes: {}};
            });
            it('checks for required values', function () {
                spyOn(testWidget, 'validate');

                testWidget.onSubmit();

                expect(testWidget.validate).toHaveBeenCalled();
            });
            it('submits the data only if validate returns true', function () {
                spyOn(testWidget, 'submitJob');
                spyOn(testWidget, 'getGUID').and.returnValue('blah');

                testWidget.onSubmit();

                expect(testWidget.submitJob.calls.count()).toEqual(0);

                spyOn(testWidget, 'validate').and.returnValue(feature);

                testWidget.onSubmit();

                expect(testWidget.submitJob.calls.count()).toEqual(1);
                expect(testWidget.getGUID.calls.count()).toEqual(1);
            });
            it('stores the station in newStation property', function () {
                var value = 'blah';
                spyOn(testWidget, 'getGUID').and.returnValue(value);
                spyOn(testWidget, 'validate').and.returnValue(feature);

                testWidget.onSubmit();

                expect(testWidget.newStation.attributes[AGRC.fieldNames.stations.STATION_ID]).toEqual(value);
            });
        });
        describe('validate', function () {
            var name;
            var option;
            function setToValid() {
                testWidget.stationNameTxt.value = name;
                testWidget.streamTypeSelect.value = 'blah';
            }
            beforeEach(function () {
                option = domConstruct.create('option', {value: 'blah'});
                name = 'A Great Station Name';
                testWidget.streamTypeSelect.add(option);
            });
            it('displays an invalid message if there is no Name value', function () {
                testWidget.stationNameTxt.value = '';

                expect(testWidget.validateMsgs.name).toBeDefined();
                expect(testWidget.validate()).toBe(false);
                expect(testWidget.validateMsg.innerHTML).toBe(testWidget.validateMsgs.name);
            });
            it('clears out any existing validate messages', function () {
                testWidget.validateMsg.innerHTML = 'blah';
                setToValid();
                spyOn(testWidget.pointDef, 'getPoint').and.returnValue(point);

                expect(testWidget.validate()).toBeDefined();
                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
            it('displays on invalid message if there is no Stream type value', function () {
                setToValid();
                testWidget.streamTypeSelect.value = '';
                spyOn(testWidget.pointDef, 'getPoint').and.returnValue(point);

                expect(testWidget.validateMsgs.type).toBeDefined();
                expect(testWidget.validate()).toBe(false);
                expect(testWidget.validateMsg.innerHTML).toBe(testWidget.validateMsgs.type);
            });
            it('displays an invalid message if there is no locaiton defined', function () {
                setToValid();
                spyOn(testWidget.pointDef, 'getPoint').and.returnValue(false);

                expect(testWidget.validateMsgs.point).toBeDefined();
                expect(testWidget.validate()).toBe(false);
                expect(testWidget.validateMsg.innerHTML).toBe(testWidget.validateMsgs.point);
            });
            it('returns an object appropriate for submitting data to the new station service', function () {
                setToValid();
                spyOn(testWidget.pointDef, 'getPoint').and.returnValue(point);

                var value = testWidget.validate();

                expect(value).toEqual({
                    geometry: {
                        x: point.x,
                        y: point.y,
                        spatialReference: {
                            wkid: 26912
                        }
                    },
                    attributes: {
                        'NAME': name,
                        'STREAM_TYPE': option.value
                    }
                });
            });
        });
        describe('onSuccessfulSubmit', function () {
            var obj;
            var name;
            beforeEach(function () {
                obj = {attributes: {}, geometry: point};
                obj.attributes[AGRC.fieldNames.stations.NAME] = 'station name';
                testWidget.newStation = obj;
                name = obj.attributes[AGRC.fieldNames.stations.NAME];
                $(testWidget.domNode).find('select').combobox();
            });
            it('clears the form values', function () {
                spyOn(testWidget.pointDef, 'clear');
                testWidget.stationNameTxt.value = 'blah';
                testWidget.streamTypeSelect.selectedIndex = 1;

                testWidget.onSuccessfulSubmit();

                expect(testWidget.stationNameTxt.value).toEqual('');
                expect(testWidget.streamTypeSelect.value).toEqual('');
                expect(testWidget.pointDef.clear).toHaveBeenCalled();
            });
            xit('closes the dialog', function () {
                spyOn($(testWidget.stationDialog), 'modal');

                testWidget.onSuccessfulSubmit();

                expect($(testWidget.stationDialog).modal).toHaveBeenCalledWith('hide');
            });
            it('sets the station text box in the main form', function () {
                testWidget.stationNameTxt.value = name;

                testWidget.onSuccessfulSubmit();

                expect(testWidget.stationTxt.value).toEqual(name);
            });
            // not sure how to test this since the styles are dependent upon Station.css
            xit('shows and then hides success message', function () {
                jasmine.Clock.useMock();

                testWidget.onSuccessfulSubmit();

                expect(domStyle.get(testWidget.successMsg, 'display')).toEqual('block');

                jasmine.Clock.tick(251);

                expect(domStyle.get(testWidget.successMsg, 'display')).toEqual('none');
            });
        });
        describe('getGUID', function () {
            it('return a 36 length string', function () {
                expect(testWidget.getGUID().length).toBe(38);
            });
        });
        describe('onError', function () {
            it('clears out the newStation property', function () {
                testWidget.newStation = 'blah';

                testWidget.onError({});

                expect(testWidget.newStation).toBeNull();
            });
            it('sets the error message', function () {
                testWidget.onError({});

                expect(testWidget.validateMsg.innerHTML).toEqual(testWidget.newStationErrMsg);
            });
        });
    });
});
