require([
    'app/config',
    'app/method/Equipment',

    'dojo/dom-construct',

    'localforage'
], function (
    config,
    Equipment,

    domConstruct,

    localforage
) {
    describe('app/method/Equipment', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Equipment({
                cacheId: 'equipment/test'
            }, domConstruct.create('div', {}, document.body));
        });
        afterEach(function (done) {
            testWidget.destroyRecursive();
            testWidget = null;
            localforage.clear().then(done);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Equipment));
        });
        describe('getData', function () {
            it('adds the event id', function () {
                var eventId = 'hello';
                config.eventId = eventId;
                testWidget.numberAnodesTxt.value = 5;

                expect(testWidget.getData()[config.fieldNames.equipment.EVENT_ID]).toBe(eventId);
            });
            it('adds the type', function () {
                testWidget.numberAnodesTxt.value = 5;

                expect(testWidget.getData()[config.fieldNames.equipment.TYPE]).toBe('backpack');
            });
        });
        describe('isValid', function () {
            it('check all required fields', function () {
                expect(testWidget.isValid())
                    .toEqual(true);
            });
        });
        describe('onCathodeTypeChange', function () {
            it('disables cathode diameter if boat', function () {
                testWidget.onCathodeTypeChange('nb');
                testWidget.onCathodeTypeChange('');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(false);

                testWidget.onCathodeTypeChange('b');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(true);

                testWidget.onCathodeTypeChange('nb');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(false);
            });
            it('clears the value in the cathode diameter text box', function () {
                testWidget.cathodeDiameterTxt.value = '2';

                testWidget.onCathodeTypeChange('somethingelse');

                expect(testWidget.cathodeDiameterTxt.value).toEqual('2');

                testWidget.onCathodeTypeChange('b');

                expect(testWidget.cathodeDiameterTxt.value).toEqual('');
            });
        });
        describe('onAnodeNumChange', function () {
            it('adds or deletes rows to match the anode number', function () {
                // add rows
                var num = testWidget.numberAnodesTxt.value = 5;

                testWidget.onAnodeNumChange();

                expect(testWidget.grid.collection.data.length).toEqual(num);

                // remove rows
                num = testWidget.numberAnodesTxt.value = 1;

                testWidget.onAnodeNumChange();

                expect(testWidget.grid.collection.data.length).toEqual(num);
            });
        });
        describe('addRow', function () {
            it('adds a row to the grid', function () {
                testWidget.addRow();

                var lastRow = testWidget.grid.collection.data[0];

                expect(lastRow[config.fieldNames.anodes.ANODE_DIAMETER]).toBeNull();
                expect(lastRow[config.fieldNames.anodes.STOCK_DIAMETER]).toBeNull();
                expect(lastRow[testWidget.idProperty]).toEqual(jasmine.any(Number));
            });
        });
    });
});
