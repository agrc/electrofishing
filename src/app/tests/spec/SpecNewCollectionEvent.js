require([
    'app/NewCollectionEvent',
    'dojo/dom-class',
    'dojo/dom-construct'

],

function (
    NewCollectionEvent,
    domClass,
    domConstruct
    ) {
    describe('app/NewCollectionEvent', function () {
        var testWidget;
        beforeEach(function () {
            AGRC.app = {
                header: {
                    submitBtn: domConstruct.create('button')
                }
            };
            testWidget = new NewCollectionEvent();
            localStorage.clear('reportArchives');

            spyOn(testWidget.locationTb, 'clear');
            spyOn(testWidget.catchTb, 'clear');
            spyOn(testWidget.methodTb, 'clear');
            spyOn(testWidget.habitatTb, 'clear');
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(NewCollectionEvent));
        });
        describe('onSubmit', function () {
            beforeEach(function () {
                spyOn(testWidget.locationTb.station, 'getStationId').and.returnValue('blah');
            });
            it('sets invalid message if validateReport returns a string', function () {
                var value = 'blah';
                spyOn(testWidget, 'validateReport').and.returnValue(value);

                testWidget.onSubmit();

                expect(testWidget.validateMsg.innerHTML).toEqual(value);
            });
            it('leaves the invalid message alone if validateReport returns true', function () {
                spyOn(testWidget, 'validateReport').and.returnValue(true);

                testWidget.onSubmit();

                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
            it('clears any previous invalid messages', function () {
                spyOn(testWidget, 'validateReport').and.returnValue(true);
                testWidget.validateMsg.innerHTML = 'blah';

                testWidget.onSubmit();

                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
            it('stores the report in localstorage', function () {
                spyOn(testWidget, 'validateReport').and.returnValue(true);

                testWidget.onSubmit();
                testWidget.onSubmit();

                expect(localStorage.reportsArchive).toBeDefined();
                expect(JSON.parse(localStorage.reportsArchive).length).toBe(2);
            });
        });
        describe('validateReport', function () {
            it('return true if everything is valid', function () {
                spyOn(testWidget.locationTb, 'hasValidLocation').and.returnValue(true);
                spyOn(testWidget.methodTb, 'isValid').and.returnValue(true);
                spyOn(testWidget.catchTb, 'isValid').and.returnValue(true);

                expect(testWidget.validateReport()).toBe(true);
            });
            it('returns error message if location isn\'t valid', function () {
                var value = 'blah';
                spyOn(testWidget.locationTb, 'hasValidLocation').and.returnValue(value);
                spyOn(testWidget.methodTb, 'isValid').and.returnValue(true);
                spyOn(testWidget.catchTb, 'isValid').and.returnValue(true);

                expect(testWidget.validateReport()).toEqual(value);
            });
            it('returns error message if method isn\'t valid', function () {
                var value = 'blah';
                spyOn(testWidget.locationTb, 'hasValidLocation').and.returnValue(true);
                spyOn(testWidget.methodTb, 'isValid').and.returnValue(value);
                spyOn(testWidget.catchTb, 'isValid').and.returnValue(true);

                expect(testWidget.validateReport()).toEqual(value);
            });
            it('switches to the location tab if not valid', function () {
                spyOn(testWidget.locationTb, 'hasValidLocation').and.returnValue('blah');
                spyOn(testWidget.methodTb, 'isValid').and.returnValue(true);
                spyOn(testWidget.catchTb, 'isValid').and.returnValue(true);
                spyOn(testWidget, 'showTab');

                testWidget.validateReport();

                expect(testWidget.showTab).toHaveBeenCalledWith('locationTab');
            });
        });
        describe('onSuccessfulSubmit', function () {
            it('calls clearReport', function () {
                spyOn(testWidget, 'clearReport');

                testWidget.onSuccessfulSubmit();

                expect(testWidget.clearReport).toHaveBeenCalled();
            });
            it('shows a success message', function () {
                testWidget.onSuccessfulSubmit();

                expect(domClass.contains(testWidget.successMsgContainer, 'hidden')).toBe(false);
            });
            it('clears all of the widgets', function () {
                testWidget.onSuccessfulSubmit();

                expect(testWidget.locationTb.clear).toHaveBeenCalled();
                expect(testWidget.catchTb.clear).toHaveBeenCalled();
                expect(testWidget.methodTb.clear).toHaveBeenCalled();
                expect(testWidget.habitatTb.clear).toHaveBeenCalled();
            });
        });
        describe('clearReport', function () {
            it('calls the appropriate methods on its child objects', function () {
                testWidget.validateMsg.innerHTML = 'blah';

                testWidget.clearReport();

                expect(testWidget.locationTb.clear).toHaveBeenCalled();
                expect(testWidget.validateMsg.innerHTML).toEqual('');
            });
        });
        describe('onCancel', function () {
            beforeEach(function () {
                spyOn(testWidget, 'clearReport');
            });
            it('calls the appropriate methods and clears the validate message', function () {
                spyOn(window, 'confirm').and.returnValue(true);

                testWidget.onCancel();

                expect(window.confirm).toHaveBeenCalledWith(testWidget.cancelConfirmMsg);
                expect(testWidget.clearReport).toHaveBeenCalled();
            });
            it('doesn\'t call clearReport on confirm cancel', function () {
                spyOn(window, 'confirm').and.returnValue(false);

                testWidget.onCancel();

                expect(testWidget.clearReport).not.toHaveBeenCalled();
            });
        });
        describe('buildFeatureObject', function () {
            var utmGeo;
            var stationId;
            var geoDef;
            var length;
            var dateTxt = '1923-02-04';
            beforeEach(function () {
                utmGeo = 'blah1';
                testWidget.locationTb.utmGeo = utmGeo;
                stationId = 'blah2';
                spyOn(testWidget.locationTb.station, 'getStationId').and.returnValue(stationId);
                geoDef = 'blah3';
                testWidget.locationTb.currentGeoDef.geoDef = geoDef;
                length = '500';
                testWidget.locationTb.streamLengthTxt.value = length;
                testWidget.locationTb.dateTxt.value = dateTxt;
            });
            it('returns an appropriate object with location-related fields', function () {
                var value = testWidget.buildFeatureObject();

                expect(value.attributes[AGRC.fieldNames.samplingEvents.STATION_ID]).toEqual(stationId);
                expect(value.attributes[AGRC.fieldNames.samplingEvents.GEO_DEF]).toEqual(geoDef);
                expect(value.geometry).toEqual(utmGeo);
                expect(value.attributes[AGRC.fieldNames.samplingEvents.EVENT_DATE]).toEqual(dateTxt);
                expect(value.attributes[AGRC.fieldNames.samplingEvents.SEGMENT_LENGTH]).toEqual(length);
                expect(value.attributes[AGRC.fieldNames.samplingEvents.EVENT_ID].length).toBe(38);
            });
            it('returns the additional location notes field', function () {
                var txt = 'blah';

                var value = testWidget.buildFeatureObject();

                expect(value.attributes[AGRC.fieldNames.samplingEvents.LOCATION_NOTES]).toEqual('');

                testWidget.locationTb.additionalNotesTxt.value = txt;

                value = testWidget.buildFeatureObject();

                expect(value.attributes[AGRC.fieldNames.samplingEvents.LOCATION_NOTES]).toEqual(txt);
            });
        });
        describe('showTab', function () {
            it('shows the passed in tab', function () {
                var tab = 'methodTab';
                spyOn(window, '$').and.returnValue({tab: function () {}});

                testWidget.showTab(tab);

                expect(window.$).toHaveBeenCalledWith('.nav-tabs a[href="#' + tab + '"]');
            });
        });
    });
});
