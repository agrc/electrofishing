require([
    'app/config',
    'app/habitat/Habitat',

    'dojo/dom-class',
    'dojo/dom-construct'
], function (
    config,
    Habitat,

    domClass,
    domConstruct
) {
    describe('app/habitat/Habitat', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        beforeEach(function () {
            testWidget = new Habitat({
                loadComboBoxes() {}
            }, domConstruct.create('div', {}, document.body));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Habitat));
        });
        describe('clear', function () {
            it('clears all text boxes and resets all comboboxes', function (done) {
                testWidget.finesTxt.value = '2';
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

                // call this manually since we aren't waiting for lst to resolve in postCreate
                $(testWidget.domNode).find('select').combobox();

                testWidget.clear().then(() => {
                    expect(testWidget.finesTxt.value).toEqual('');
                    expect(testWidget.springSelect.value).toEqual('');
                    expect(testWidget.acidityTxt.value).toEqual('');
                    expect(testWidget.sedTotalSpan.innerHTML).toEqual('0');

                    done();
                });
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
                var f = data[0];

                expect(f[config.fieldNames.habitat.SUB_FINES]).toEqual(2);
                expect(f[config.fieldNames.habitat.SPNG]).toEqual('blah');
                expect(f[config.fieldNames.habitat.PH]).toEqual(4);
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

        describe('getTransectData', function () {
            it('returns the appropriate objects', function () {
                var eventId = 'test';
                config.eventId = eventId;
                testWidget.transects = {
                    1: { a: 'a', b: 'b' },
                    2: { a: 'aa', b: 'bb'}
                };

                var data = testWidget.getTransectData();

                expect(data.length).toBe(2);
                expect(data[0].a).toBe('a');
                expect(data[1].b).toBe('bb');
                expect(data[1][config.fieldNames.transect.EVENT_ID]).toBe(eventId);
            });
        });

        describe('wetted width and start distance', () => {
            it('is valid with undefined wetted width value', () => {
                let wettedWidth;

                testWidget.store.data[0] = { DEPTH: 1, DISTANCE_START: null };
                testWidget.store.data[1] = { DEPTH: 10, DISTANCE_START: 9 };

                const valid = testWidget._validateWidth(wettedWidth);

                expect(valid.result).toBe(true);
                expect(valid.message).toContain('does not have a value');
            });
            it('is valid with null wetted width value', () => {
                const wettedWidth = null;

                testWidget.store.data[0] = { DEPTH: 1, DISTANCE_START: null };
                testWidget.store.data[1] = { DEPTH: 10, DISTANCE_START: 9 };

                const valid = testWidget._validateWidth(wettedWidth);

                expect(valid.result).toBe(true);
                expect(valid.message).toContain('does not have a value');
            });
            it('is valid when start distances are empty', () => {
                const wettedWidth = 10;

                testWidget.store.data[0] = { DEPTH: 1, DISTANCE_START: null };
                testWidget.store.data[1] = { DEPTH: 10, DISTANCE_START: null };

                const valid = testWidget._validateWidth(wettedWidth);

                expect(valid.result).toBe(true);
                expect(valid.message).toBeNull();
            });
            it('is valid when wetted width value is greater than all start distances', () => {
                const wettedWidth = 10;

                testWidget.store.data[0] = { DEPTH: 1, DISTANCE_START: null };
                testWidget.store.data[1] = { DEPTH: 10, DISTANCE_START: 9 };
                testWidget.store.data[2] = { DEPTH: 10, DISTANCE_START: 3.01 };

                const valid = testWidget._validateWidth(wettedWidth);

                expect(valid.result).toBe(true);
                expect(valid.message).toBeNull();
            });
            it('is not valid when wetted width value is smaller than any start distances', () => {
                const wettedWidth = 10;

                testWidget.store.data[0] = { DEPTH: 1, DISTANCE_START: 11 };
                testWidget.store.data[1] = { DEPTH: 10, DISTANCE_START: 9 };
                testWidget.store.data[2] = { DEPTH: 10, DISTANCE_START: 3.01 };

                const valid = testWidget._validateWidth(wettedWidth);

                expect(valid.result).toBe(false);
                expect(valid.message).toContain('less than');
            });
        });

        describe('onRemoveTransect', function () {
            it('removes the transect object', function () {
                testWidget.gridTab.addTab();

                expect(testWidget.transects[2]).toBeDefined();

                testWidget.gridTab.removeTab();

                expect(testWidget.transects[2]).not.toBeDefined();
            });
        });
    });
});
