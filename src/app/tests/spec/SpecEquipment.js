require([
    'app/config',
    'app/method/Equipment',

    'dojo/dom-construct'
], function (
    config,
    Equipment,

    domConstruct
) {
    describe('app/method/Equipment', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Equipment(null, domConstruct.create('div', {}, document.body));
        });
        afterEach(function () {
            testWidget.destroyRecursive();
            testWidget = null;
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
                    .toEqual('Missing value for Voltage!');
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
    });
});
