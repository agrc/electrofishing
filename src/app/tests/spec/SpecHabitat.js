require([
    'app/habitat/Habitat',

    'dojo/_base/window',

    'dojo/dom-construct',
    'dojo/dom-class'

], function (
    Habitat,

    win,

    domConstruct,
    domClass
) {
    describe('app/habitat/Habitat', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new Habitat({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Habitat));
        });
        describe('clear', function () {
            it('clears all text boxes and resets all comboboxes', function () {
                testWidget.finesTxt.value = '2';
                testWidget.vegDensityTxt.value = '2';
                domConstruct.create('option', {
                    innerHTML: '',
                    value: ''
                }, testWidget.springSelect);
                domConstruct.create('option', {
                    innerHTML: 'blah',
                    value: 'blah'
                }, testWidget.springSelect);
                testWidget.springSelect.selectedIndex = 1;
                testWidget.acidityTxt.value = '2';
                testWidget.sedTotalSpan.innerHTML = '99';

                testWidget.clear();

                expect(testWidget.finesTxt.value).toEqual('');
                expect(testWidget.vegDensityTxt.value).toEqual('');
                expect(testWidget.springSelect.value).toEqual('');
                expect(testWidget.acidityTxt.value).toEqual('');
                expect(testWidget.sedTotalSpan.innerHTML).toEqual('0');
            });
        });
        describe('isValid', function () {
            it('verifies that the sed classes add up to 100', function () {
                // less than 100
                testWidget.finesTxt.value = 16;
                testWidget.sandTxt.value = 16;
                testWidget.gravelTxt.value = 16;
                testWidget.cobbleTxt.value = 16;
                testWidget.rubbleTxt.value = 16;
                testWidget.boulderTxt.value = 19;
                testWidget.onSedimentClassChange(); // make sure that the total is correct

                expect(testWidget.isValid()).toEqual(testWidget.badSedClassesErrMsg);

                // 100
                testWidget.boulderTxt.value = 20;
                testWidget.onSedimentClassChange(); // make sure that the total is correct

                expect(testWidget.isValid()).toEqual(true);

                // more than 100
                testWidget.boulderTxt.value = 22;
                testWidget.onSedimentClassChange(); // make sure that the total is correct

                expect(testWidget.isValid()).toEqual(testWidget.badSedClassesErrMsg);
            });
        });
        describe('getData', function () {
            it('returns a valid record set object', function () {
                testWidget.finesTxt.value = 2;
                testWidget.vegDensityTxt.value = 3;
                domConstruct.create('option', {
                    innerHTML: '',
                    value: ''
                }, testWidget.springSelect);
                domConstruct.create('option', {
                    innerHTML: 'blah',
                    value: 'blah'
                }, testWidget.springSelect);
                testWidget.springSelect.selectedIndex = 1;
                testWidget.acidityTxt.value = 4;

                var data = testWidget.getData();
                var f = data.features[0].attributes;

                expect(data.displayFieldName).toEqual('');
                expect(f[AGRC.fieldNames.habitat.SUB_FINES]).toEqual('2');
                expect(f[AGRC.fieldNames.habitat.VEGD]).toEqual('3');
                expect(f[AGRC.fieldNames.habitat.SPNG]).toEqual('blah');
                expect(f[AGRC.fieldNames.habitat.PH]).toEqual('4');
            });
        });
        describe('onSedimentClassChange', function () {
            it('updates total and css', function () {
                testWidget.finesTxt.value = 16;
                testWidget.sandTxt.value = 16;
                testWidget.gravelTxt.value = 16;
                testWidget.cobbleTxt.value = 16;
                testWidget.rubbleTxt.value = 16;
                testWidget.boulderTxt.value = 20;

                testWidget.onSedimentClassChange();

                expect(testWidget.sedTotalSpan.innerHTML).toEqual('100');
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-success')).toBe(true);
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-danger')).toBe(false);

                testWidget.finesTxt.value = 16;
                testWidget.sandTxt.value = 16;
                testWidget.gravelTxt.value = 16;
                testWidget.cobbleTxt.value = 16;
                testWidget.rubbleTxt.value = 16;
                testWidget.boulderTxt.value = 16;

                testWidget.onSedimentClassChange();

                expect(testWidget.sedTotalSpan.innerHTML).toEqual('96');
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-success')).toBe(false);
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-danger')).toBe(true);

                testWidget.finesTxt.value = '';
                testWidget.sandTxt.value = '';
                testWidget.gravelTxt.value = '';
                testWidget.cobbleTxt.value = '';
                testWidget.rubbleTxt.value = '';
                testWidget.boulderTxt.value = '';

                testWidget.onSedimentClassChange();

                expect(testWidget.sedTotalSpan.innerHTML).toEqual('0');
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-success')).toBe(false);
                expect(domClass.contains(
                    testWidget.sedTotalSpan.parentElement, 'text-danger')).toBe(false);
            });
        });
    });
});