require([
    'app/catch/Tag',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/dom-class'

],

function (
    Tag,
    domConstruct,
    win,
    domClass
    ) {
    describe('app/catch/Tag', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var type = 'type';
        var location = 'blah';
        var num = '4';
        var fishId = 'blah3';
        var fn = AGRC.fieldNames.tags;
        function setData() {
            function populateSelect(select, value) {
                domConstruct.create('option', {value: value}, select);
                select.value = value;
            }
            populateSelect(testWidget.typeSelect, type);
            populateSelect(testWidget.locationSelect, location);
            testWidget.numberTxt.value = num;
        }
        beforeEach(function () {
            testWidget = new Tag({
                container: {currentFishId: fishId}
            }, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
            $(testWidget.domNode).find('select').combobox();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Tag));
        });
        describe('clearValues', function () {
            it('clears all values', function () {
                setData();

                testWidget.clearValues();

                expect(testWidget.typeSelect.value).toEqual('');
                expect(testWidget.locationSelect.value).toEqual('');
                expect(testWidget.numberTxt.value).toEqual('');
            });
        });
        describe('getData', function () {
            it('returns a data object', function () {
                setData();

                var data = testWidget.getData().attributes;

                expect(data[fn.NUMBER]).toEqual(num);
                expect(data[fn.TYPE]).toEqual(type);
                expect(data[fn.LOCATION]).toEqual(location);
                expect(data[fn.FISH_ID]).toEqual(fishId);
            });
            it('returns null if there is no data', function () {
                expect(testWidget.getData()).toBeNull();
            });
        });
        describe('setData', function () {
            var data = {attributes: {}};
            data.attributes[fn.NUMBER] = num;
            data.attributes[fn.TYPE] = type;
            data.attributes[fn.LOCATION] = location;
            data.attributes[fn.FISH_ID] = fishId;
            var isMinus = function () {
                return domClass.contains(testWidget.icon, testWidget.minusIconClass) &&
                    !domClass.contains(testWidget.icon, testWidget.plusIconClass);
            };
            it('sets controls to passed in values', function () {
                setData();
                testWidget.clearValues();

                testWidget.setData(data);

                expect(testWidget.numberTxt.value).toEqual(num);
                expect(testWidget.typeSelect.value).toEqual(type);
                expect(testWidget.locationSelect.value).toEqual(location);
                expect(testWidget.container.currentFishId).toEqual(fishId);
            });
            it('sets the icon to minus if lastOne is false', function () {
                setData();

                testWidget.setData(data, false);

                expect(isMinus()).toBe(true);
            });
            it('doesnt mess with the icon if lastOne is true', function () {
                setData();

                testWidget.setData(data, true);

                expect(isMinus()).toBe(false);
            });
        });
    });
});
