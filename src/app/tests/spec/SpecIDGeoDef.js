require([
    'app/config',
    'app/location/IDGeoDef',

    'dojo/Deferred',
    'dojo/dom-class',
    'dojo/on'
], function (
    config,
    IDGeoDef,

    Deferred,
    domClass,
    on
) {
    describe('app/location/IDGeoDef', function () {
        var testWidget;
        var mockReturn = {
            id: 123,
            type: 'blah'
        };
        beforeEach(function () {
            testWidget = new IDGeoDef();
        });
        afterEach(function () {
            testWidget = null;
        });

        describe('constructor', function () {
            it('creates a valid object', function () {
                expect(testWidget).toEqual(jasmine.any(IDGeoDef));
            });
            it('defines a the gpServiceUrl property', function () {
                expect(testWidget.gpServiceUrl).toEqual(config.urls.getSegmentFromID);
            });
            it('sets defs to an empty array', function () {
                expect(testWidget.defs).toEqual([]);
            });
        });
        describe('onInvalidate', function () {
            it('clears the other text box when text is entered', function () {
                testWidget.waterIDBox.value = 'blah';

                testWidget.onInvalidate(testWidget.waterIDBox);

                expect(testWidget.waterIDBox.value).toBe('');

                testWidget.reachBox.value = 'blah';

                testWidget.onInvalidate(testWidget.reachBox);

                expect(testWidget.reachBox.value).toBe('');
            });
        });
        describe('getID', function () {
            var validReachValue = '12345678901234';
            it('validates the number of digits for reach codes', function () {
                testWidget.reachBox.value = '123456';

                expect(testWidget.getID()).toBe(false);
                expect(testWidget.reachBoxTxt.innerHTML).toEqual(testWidget.notEnoughDigitsMsg);
                expect(domClass.contains(testWidget.reachGroup, 'error')).toBe(true);

                testWidget.reachBox.value = validReachValue;

                expect(testWidget.getID()).toBeDefined();
                expect(testWidget.reachBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.reachGroup, 'error')).toBe(false);

                testWidget.reachBox.value = '123456798012345';

                expect(testWidget.getID()).toBe(false);
                expect(testWidget.reachBoxTxt.innerHTML).toEqual(testWidget.tooManyDigitsMsg);
                expect(domClass.contains(testWidget.reachGroup, 'error')).toBe(true);
            });
            it('returns false if there are no values', function () {
                expect(testWidget.getID()).toBe(false);
            });
            it('clears any existing validate messages', function () {
                testWidget.reachBoxTxt.innerHTML = 'blah';
                domClass.add(testWidget.reachGroup, 'error');
                testWidget.waterIDBoxTxt.innerHTML = 'blah';
                domClass.add(testWidget.waterIDGroup, 'error');
                testWidget.reachBox.value = validReachValue;

                testWidget.getID();

                expect(testWidget.reachBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.reachGroup, 'error')).toBe(false);
                expect(testWidget.waterIDBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.waterIDGroup, 'error')).toBe(false);
            });
            it('returns the current valid id value and type for reach codes', function () {
                testWidget.reachBox.value = validReachValue;

                var value = testWidget.getID();

                expect(value).toEqual({
                    id: validReachValue,
                    type: config.idTypes.reachcode
                });
            });
            it('returns the current valid id value and type for waterbody ids', function () {
                var id = '123';
                testWidget.waterIDBox.value = id;

                var value = testWidget.getID();

                expect(value).toEqual({
                    id: id,
                    type: config.idTypes.waterbodyid
                });
            });
        });
        describe('wireEvents', function () {
            it('wires onInvalidate to textboxes onchange event', function () {
                spyOn(testWidget, 'onInvalidate');

                on.emit(testWidget.waterIDBox, 'change', {bubbles: true});
                on.emit(testWidget.reachBox, 'change', {bubbles: true});

                expect(testWidget.onInvalidate.calls.count()).toBe(2);
            });
            it('wire getID to textboxes blur event', function () {
                spyOn(testWidget, 'getID');

                on.emit(testWidget.waterIDBox, 'blur', {bubbles: true});
                on.emit(testWidget.reachBox, 'blur', {bubbles: true});

                expect(testWidget.getID.calls.count()).toBe(2);
            });
        });
        describe('getGeometry', function () {
            it('returns a Deferred object if it has a valid id', function () {
                spyOn(testWidget, 'getID').and.returnValue(mockReturn);

                expect(testWidget.getGeometry()).toEqual(jasmine.any(Deferred));
            });
            it('returns an invalid message if it doesn\'t have a valid id', function () {
                spyOn(testWidget, 'getID').and.returnValue(false);

                expect(testWidget.getGeometry()).toEqual(testWidget.invalidMsg);
            });
            it('calls getXHRParams', function () {
                spyOn(testWidget, 'getXHRParams');
                spyOn(testWidget, 'getID').and.returnValue(mockReturn);

                testWidget.getGeometry();

                expect(testWidget.getXHRParams).toHaveBeenCalledWith(mockReturn.id, mockReturn.type);
            });
            it('sets the geoDef property', function () {
                spyOn(testWidget, 'getID').and.returnValue(mockReturn);

                testWidget.getGeometry();

                expect(testWidget.geoDef).toEqual('id:' + mockReturn.id + '|type:' + mockReturn.type);
            });
        });
        describe('getXHRParams', function () {
            it('sets the appropriate values', function () {
                var value = testWidget.getXHRParams(mockReturn.id, mockReturn.type);

                expect(value.query.id).toEqual(mockReturn.id);
                expect(value.query.type).toEqual(mockReturn.type);
            });
        });
    });
});
