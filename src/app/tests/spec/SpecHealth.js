require([
    'app/catch/Health',

    'dojo/dom-construct',
    'dojo/_base/window'
],

function (
    Health,

    domConstruct,
    win
) {
    describe('app/catch/Health', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var fn = AGRC.fieldNames.health;
        var eye = 'M1';
        var kidney = 'N';
        var fin = 'M';
        var plasma = '3';
        function setData() {
            function populateSelect(select, value) {
                domConstruct.create('option', {value: value}, select);
                select.value = value;
            }
            populateSelect(testWidget.eyeConditionSelect, eye);
            populateSelect(testWidget.kidneyConditionSelect, kidney);
            populateSelect(testWidget.finConditionSelect, fin);
            testWidget.plasmaTxt.value = plasma;

            // call this manually since we aren't waiting for lst to resolve in postCreate
            $(testWidget.domNode).find('select').combobox();
        }
        beforeEach(function () {
            testWidget = new Health({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Health));
        });
        describe('clearValues', function () {
            it('clears all values', function () {
                setData();

                testWidget.clearValues();

                expect(testWidget.eyeConditionSelect.value).toEqual('');
                expect(testWidget.kidneyConditionSelect.value).toEqual('');
                expect(testWidget.finConditionSelect.value).toEqual('');
                expect(testWidget.plasmaTxt.value).toEqual('');
            });
        });
        describe('getData', function () {
            it('builds a record set from values', function () {
                setData();
                testWidget.currentFishId = 'blah';

                var data = testWidget.getData();

                var f = data.attributes;

                expect(f[fn.EYE]).toEqual(eye);
                expect(f[fn.KIDNEY]).toEqual(kidney);
                expect(f[fn.FIN]).toEqual(fin);
                expect(f[fn.PLPRO]).toEqual(3);
                expect(f[fn.FISH_ID]).toEqual('blah');
            });
            it('returns null if no values are entered', function () {
                expect(testWidget.getData()).toBeNull();
            });
        });
        describe('setData', function () {
            var data = {attributes: {}};
            data.attributes[fn.EYE] = eye;
            data.attributes[fn.KIDNEY] = kidney;
            data.attributes[fn.FIN] = fin;
            data.attributes[fn.PLPRO] = plasma;
            it('sets values of comboboxes', function () {
                setData();
                var t = testWidget;
                t.eyeConditionSelect.value = '';
                t.kidneyConditionSelect.value = '';
                t.hematocritTxt.value = '';
                t.opercleConditionSelect.value = '';

                testWidget.setData(data);

                expect(t.eyeConditionSelect.value).toBe(eye);
                expect(t.kidneyConditionSelect.value).toBe(kidney);
                expect(t.finConditionSelect.value).toBe(fin);
                expect(t.plasmaTxt.value).toBe(plasma);
            });
        });
    });
});
