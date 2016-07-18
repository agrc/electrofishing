require([
    'app/config',
    'app/location/PointDef',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/topic'
],

function (
    config,
    PointDef,

    domClass,
    domConstruct,
    topic
) {
    describe('app/location/PointDef', function () {
        var testWidget;
        var ll;
        var ll2;
        var utm83;
        var utm27;
        var fGroup;
        var map;
        beforeEach(function () {
            ll = new L.LatLng(40.616, -111.841);
            ll2 = new L.LatLng(40.1, -111.7);
            utm83 = {x: 428861, y: 4496470};
            utm27 = {x: 428861, y: 4496494};

            testWidget = new PointDef();
            map = new L.Map(domConstruct.create('div'));
            L.tileLayer(config.urls.googleImagery, {quadWord: config.quadWord})
                .addTo(map);
            L.tileLayer(config.urls.overlay, {quadWord: config.quadWord})
                .addTo(map);
            map.setView([40, -111], 6);
            spyOn(map, 'getBounds').and.returnValue({contains: function () {}});
            fGroup = new L.FeatureGroup().addTo(map);
            testWidget.setMap(map, fGroup);

            localStorage.removeItem('coordType');
        });
        afterEach(function () {
            domConstruct.destroy(map.getContainer());
            testWidget.destroy();
            testWidget = null;
        });
        describe('constructor', function () {
            it('build some object for use later on', function () {
                expect(testWidget.utm27crs).not.toBeNull();
                expect(testWidget.icon).not.toBeNull();
            });
        });
        describe('buildRendering', function () {
            it('should initialize labels, placeholders, and currentType to default', function () {
                expect(testWidget.yLabel.innerHTML).toEqual(testWidget.labels.utm.y);
                expect(testWidget.xLabel.innerHTML).toEqual(testWidget.labels.utm.x);
                expect(testWidget.yBox.placeholder).toEqual(testWidget.labels.utm.placeY);
                expect(testWidget.xBox.placeholder).toEqual(testWidget.labels.utm.placeX);
                expect(testWidget.currentType).toEqual(config.coordTypes.utm83);
            });
            it('sets the coord type according to the localStorage value if it exists', function () {
                localStorage.coordType = config.coordTypes.ll;

                var testWidget2 = new PointDef();

                expect(testWidget2.yLabel.innerHTML).toEqual(testWidget2.labels.ll.y);
                expect(testWidget2.xLabel.innerHTML).toEqual(testWidget2.labels.ll.x);
                expect(testWidget2.yBox.placeholder).toEqual(testWidget2.labels.ll.placeY);
                expect(testWidget2.xBox.placeholder).toEqual(testWidget2.labels.ll.placeX);
                expect(testWidget2.currentType).toEqual(config.coordTypes.ll);
            });
        });
        describe('wireEvents', function () {
            it('should subscribe to the coordTypeToggle_onChange event', function () {
                spyOn(testWidget, 'onCoordTypeChange');

                testWidget.wireEvents();

                topic.publish(config.topics.coordTypeToggle_onChange, config.coordTypes.utm83);

                expect(testWidget.onCoordTypeChange).toHaveBeenCalled();
            });
            it('should wire the mapBtn click event', function () {
                spyOn(testWidget, 'onMapBtnClicked');

                testWidget.wireEvents();

                testWidget.mapBtn.click();

                expect(testWidget.onMapBtnClicked).toHaveBeenCalled();
            });
        });
        describe('onCoordTypeChange', function () {
            it('should update the labels and placeholders', function () {
                testWidget.onCoordTypeChange(config.coordTypes.ll);

                expect(testWidget.yLabel.innerHTML).toEqual(testWidget.labels.ll.y);
                expect(testWidget.xLabel.innerHTML).toEqual(testWidget.labels.ll.x);
                expect(testWidget.yBox.placeholder).toEqual(testWidget.labels.ll.placeY);
                expect(testWidget.xBox.placeholder).toEqual(testWidget.labels.ll.placeX);

                testWidget.onCoordTypeChange(config.coordTypes.utm83);

                expect(testWidget.yLabel.innerHTML).toEqual(testWidget.labels.utm.y);
                expect(testWidget.xLabel.innerHTML).toEqual(testWidget.labels.utm.x);
                expect(testWidget.yBox.placeholder).toEqual(testWidget.labels.utm.placeY);
                expect(testWidget.xBox.placeholder).toEqual(testWidget.labels.utm.placeX);

                testWidget.onCoordTypeChange(config.coordTypes.utm27);

                expect(testWidget.yLabel.innerHTML).toEqual(testWidget.labels.utm.y);
                expect(testWidget.xLabel.innerHTML).toEqual(testWidget.labels.utm.x);
                expect(testWidget.yBox.placeholder).toEqual(testWidget.labels.utm.placeY);
                expect(testWidget.xBox.placeholder).toEqual(testWidget.labels.utm.placeX);
            });
            it('should set the currentType', function () {
                testWidget.currentType = null;

                testWidget.onCoordTypeChange(config.coordTypes.ll);

                expect(testWidget.currentType).toEqual(config.coordTypes.ll);

                testWidget.currentType = null;

                testWidget.onCoordTypeChange(config.coordTypes.utm27);

                expect(testWidget.currentType).toEqual(config.coordTypes.utm27);

                testWidget.currentType = null;

                testWidget.onCoordTypeChange(config.coordTypes.utm83);

                expect(testWidget.currentType).toEqual(config.coordTypes.utm83);
            });
        });
        describe('validate', function () {
            it('should show validate msg and add css class for utm too short', function () {
                var box = testWidget.yBox;
                box.value = '44350';

                var result = testWidget.validate(box);

                expect(result).toBe(false);
                expect(testWidget.yBoxTxt.innerHTML).toEqual(testWidget.validateMsgs.tooShort);
                expect(domClass.contains(testWidget.yGroup, testWidget.validateErrorClass)).toBeTruthy();

                box = testWidget.xBox;
                box.value = '33';

                result = testWidget.validate(box);

                expect(result).toBe(false);
                expect(testWidget.xBoxTxt.innerHTML).toEqual(testWidget.validateMsgs.tooShort);
                expect(domClass.contains(testWidget.xGroup, testWidget.validateErrorClass)).toBeTruthy();
            });
            it('should not show any messages for ll values', function () {
                testWidget.onCoordTypeChange(config.coordTypes.ll);
                var box = testWidget.xBox;

                testWidget.validate(box);

                expect(testWidget.xBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.xGroup, testWidget.validateErrorClass)).toBeFalsy();
            });
            it('should return true if the value is valid and clear out any warning message and css class', function () {
                var value = 'blah';
                var box = testWidget.yBox;
                box.value = '1234567';
                testWidget.yBoxTxt.innerHTML = value;
                domClass.add(testWidget.yGroup, value);

                expect(testWidget.validate(box)).toBe(true);
                expect(testWidget.yBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.yGroup, testWidget.validateErrorClass)).toBe(false);

                box = testWidget.xBox;
                box.value = '123456';
                testWidget.xBoxTxt.innerHTML = value;
                domClass.add(testWidget.xGroup, value);

                expect(testWidget.validate(box)).toBe(true);
                expect(testWidget.xBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.xGroup, testWidget.validateErrorClass)).toBe(false);
            });
            it('should return false, but display no message if there is no value', function () {
                testWidget.yBoxTxt.innerHTML = 'blah';
                domClass.add(testWidget.yGroup, testWidget.validateErrorClass);

                expect(testWidget.validate(testWidget.yBox)).toBe(false);

                expect(testWidget.yBoxTxt.innerHTML).toEqual('');
                expect(domClass.contains(testWidget.yGroup, testWidget.validateErrorClass)).toBe(false);
            });
        });
        describe('onMapBtnClicked', function () {
            var evt;
            beforeEach(function () {
                spyOn(testWidget, 'onMapClicked');
                evt = {
                    preventDefault: jasmine.createSpy('preventDefault')
                };
            });
            it('wire an onclick event on the map', function () {
                domClass.remove(testWidget.mapBtn, 'active');

                testWidget.onMapBtnClicked(evt);

                map.fire('click');

                expect(testWidget.onMapClicked).toHaveBeenCalled();
            });
            it('not wire the onclick event if the button was disactivated', function () {
                domClass.remove(testWidget.mapBtn, 'active');

                testWidget.onMapBtnClicked(evt);

                map.fire('click');

                expect(testWidget.onMapClicked).toHaveBeenCalled();

                domClass.add(testWidget.mapBtn, 'active');

                testWidget.onMapBtnClicked(evt);

                map.fire('click');

                expect(testWidget.onMapClicked.calls.count()).toEqual(1);
            });
            it('fire the onMapBtn topic', function () {
                spyOn(testWidget, 'onOtherMapBtnClicked');

                testWidget.wireEvents();
                testWidget.onMapBtnClicked(evt);

                expect(testWidget.onOtherMapBtnClicked).toHaveBeenCalledWith(testWidget);
            });
            it('disables the text boxes if the button is activated', function () {
                domClass.remove(testWidget.mapBtn, 'active');
                testWidget.onMapBtnClicked(evt);

                expect(testWidget.yBox.disabled).toBe(true);
                expect(testWidget.xBox.disabled).toBe(true);

                domClass.add(testWidget.mapBtn, 'active');

                testWidget.onMapBtnClicked(evt);

                expect(testWidget.yBox.disabled).toBe(false);
                expect(testWidget.xBox.disabled).toBe(false);
            });
            it('call preventDefault on the evt', function () {
                testWidget.onMapBtnClicked(evt);

                expect(evt.preventDefault).toHaveBeenCalled();
            });
            it('changes the mouse cursor for the map container', function () {
                testWidget.onMapBtnClicked(evt);

                expect(testWidget.map._container.style.cursor).toEqual('crosshair');

                domClass.add(testWidget.mapBtn, 'active');
                testWidget.onMapBtnClicked(evt);

                expect(testWidget.map._container.style.cursor).toEqual('');
            });
        });
        describe('onOtherMapBtnClicked', function () {
            it('disabled the map btn if it wasnt the widget to fire the event', function () {
                domClass.add(testWidget.mapBtn, 'active');

                testWidget.onOtherMapBtnClicked(testWidget);

                expect(domClass.contains(testWidget.mapBtn, 'active')).toBe(true);

                testWidget.onOtherMapBtnClicked({});

                expect(domClass.contains(testWidget.mapBtn, 'active')).toBe(false);
            });
            it('enable the text boxes if it isnt doing it itself', function () {
                testWidget.yBox.disabled = true;
                testWidget.xBox.disabled = true;

                testWidget.onOtherMapBtnClicked({});

                expect(testWidget.yBox.disabled).toBe(false);
                expect(testWidget.xBox.disabled).toBe(false);
            });
        });
        describe('onMapClicked', function () {
            it('add a marker to the map', function () {
                testWidget.onMapClicked({
                    latlng: ll
                });

                expect(testWidget.marker.getLatLng()).toEqual(ll);
            });
            it('move the marker if its already created', function () {
                testWidget.onMapClicked({
                    latlng: ll
                });
                testWidget.onMapClicked({
                    latlng: ll2
                });

                expect(testWidget.marker.getLatLng()).toEqual(ll2);
            });
            it('set the text box values for ll', function () {
                testWidget.onCoordTypeChange(config.coordTypes.ll);
                testWidget.onMapClicked({
                    latlng: ll
                });

                expect(testWidget.yBox.value).toEqual(ll.lat + '');
                expect(testWidget.xBox.value).toEqual(ll.lng + '');
            });
            it('set the text box value for utm83', function () {
                testWidget.onCoordTypeChange(config.coordTypes.utm83);
                testWidget.onMapClicked({
                    latlng: ll
                });

                expect(testWidget.yBox.value).toEqual(utm83.y + '');
                expect(testWidget.xBox.value).toEqual(utm83.x + '');
            });
            it('set the text box value for utm27', function () {
                testWidget.onCoordTypeChange(config.coordTypes.utm27);
                testWidget.onMapClicked({
                    latlng: ll
                });

                expect(testWidget.yBox.value).toEqual(utm27.y + '');
                expect(testWidget.xBox.value).toEqual(utm27.x + '');
            });
            it('sets the appropriate icon depending on the point type', function () {
                var testWidget2 = new PointDef({label: 'Start'});
                testWidget2.setMap(map, fGroup);

                testWidget2.onMapClicked({
                    latlng: ll
                });

                expect(testWidget2.marker.options.icon.options.iconUrl).toEqual(config.urls.startIcon);

                var testWidget3 = new PointDef({label: 'End'});
                testWidget3.setMap(map, fGroup);
                testWidget3.onMapClicked({
                    latlng: ll
                });

                expect(testWidget3.marker.options.icon.options.iconUrl).toEqual(config.urls.endIcon);
            });
        });
        describe('clear', function () {
            it('clears out the text boxes and removes the marker from the map and deletes it', function () {
                testWidget.yBox.value = 'blah';
                testWidget.xBox.value = 'blah';
                testWidget.marker = new L.Marker(ll);

                testWidget.clear();

                expect(testWidget.yBox.value).toEqual('');
                expect(testWidget.xBox.value).toEqual('');
                expect(testWidget.marker).toBeNull();
            });
            it('deselects the mapBtn and enables the textboxes', function () {
                testWidget.yBox.disabled = true;
                testWidget.xBox.disabled = false;
                domClass.add(testWidget.mapBtn, 'active');

                testWidget.clear();

                expect(testWidget.yBox.disabled).toBe(false);
                expect(testWidget.xBox.disabled).toBe(false);
                expect(domClass.contains(testWidget.mapBtn, 'active')).toBe(false);
            });
        });
        describe('getPoint', function () {
            it('return false if either of the values do not validate', function () {
                expect(testWidget.getPoint()).toBe(false);

                testWidget.yBox.value = utm83.y;

                expect(testWidget.getPoint()).toBe(false);
            });
            it('return the point if both values are valid', function () {
                testWidget.yBox.value = utm83.y;
                testWidget.xBox.value = utm83.x;

                expect(testWidget.validate(testWidget.yBox)).toBe(true);
                expect(testWidget.validate(testWidget.xBox)).toBe(true);
                testWidget.updateMarkerPosition();

                expect(testWidget.getPoint().y).toBeCloseTo(utm83.y, 2);
                expect(testWidget.getPoint().x).toBeCloseTo(utm83.x, 2);
            });
        });
        describe('onTextBoxFocusOut', function () {
            it('fires validate on xBox change even if there is no value in yBox', function () {
                spyOn(testWidget, 'validate');

                testWidget.onTextBoxFocusOut();

                expect(testWidget.validate.calls.count()).toEqual(2);
            });
        });
        describe('setMap', function () {
            it('sets the map and fGroup properties', function () {
                var map = {};
                var group = {};

                testWidget.setMap(map, group);

                expect(testWidget.map).toBe(map);
                expect(testWidget.fGroup).toBe(group);
            });
        });
    });
});
