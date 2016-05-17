require([
    'app/method/Method'

],

function (
    Method
    ) {
    "use strict";
    describe('app/method/Method', function () {
        var testWidget;
        beforeEach(function () {
            testWidget = new Method();
        });
        afterEach(function () {
            testWidget = null;
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Method));
        });
        describe('isValid', function () {
            it("check all required fields", function () {
                expect(testWidget.isValid())
                    .toEqual('Missing value for Voltage!');
            });
        });
        describe('clear', function () {
            it("clears all of the controls", function () {
                spyOn(testWidget.backpacksContainer, 'clear');
                spyOn(testWidget.canoeBargesContainer, 'clear');
                spyOn(testWidget.raftBoatsContainer, 'clear');
                testWidget.numberTxt.value = 5;
                testWidget.cathodeDiameterTxt.value = 2.3;
                testWidget.waveformSelect.value = 'ac';

                testWidget.clear();

                expect(testWidget.backpacksContainer.clear).toHaveBeenCalled();
                expect(testWidget.canoeBargesContainer.clear).toHaveBeenCalled();
                expect(testWidget.raftBoatsContainer.clear).toHaveBeenCalled();
                expect(testWidget.numberTxt.value).toBe('1');
                expect(testWidget.cathodeDiameterTxt.value).toEqual('');
                expect(testWidget.waveformSelect.value).toEqual('');
            });
        });
        describe('onCathodeTypeChange', function () {
            it("disables cathode diameter if boat", function () {
                testWidget.onCathodeTypeChange('nb');
                testWidget.onCathodeTypeChange('');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(false);

                testWidget.onCathodeTypeChange('b');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(true);

                testWidget.onCathodeTypeChange('nb');

                expect(testWidget.cathodeDiameterTxt.disabled).toBe(false);
            });
            it("clears the value in the cathode diameter text box", function () {
                testWidget.cathodeDiameterTxt.value = '2';

                testWidget.onCathodeTypeChange('somethingelse');

                expect(testWidget.cathodeDiameterTxt.value).toEqual('2');

                testWidget.onCathodeTypeChange('b');

                expect(testWidget.cathodeDiameterTxt.value).toEqual('');
            });
        });
    });
});