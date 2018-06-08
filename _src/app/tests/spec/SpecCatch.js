require([
    'app/catch/Catch',
    'app/config',

    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/keys',
    'dojo/on',
    'dojo/query',
    'dojo/_base/window',

    'localforage'
], function (
    Catch,
    config,

    domClass,
    domConstruct,
    keys,
    on,
    query,
    win,

    localforage
) {
    const FN = config.fieldNames.fish;

    describe('app/catch/Catch', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var fn = config.fieldNames.fish;
        config.eventId = 'blah';
        beforeEach(function () {
            testWidget = new Catch({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function (done) {
            destroy(testWidget);

            localforage.clear().then(done);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Catch));
        });
        describe('postCreate', function () {
            it('should initialize an empty row', function () {
                expect(testWidget.store.data.length).toBe(1);

                var f = testWidget.store.data[0];

                expect(f[fn.EVENT_ID]).not.toBeNull();
            });
        });
        describe('validateBatchForm', function () {
            it('enables the button if weight value present', function () {
                testWidget.batchWeightTxt.value = '1';

                testWidget.validateBatchForm();

                expect(testWidget.batchGoBtn.disabled).toBe(false);

                testWidget.batchWeightTxt.value = '';

                testWidget.validateBatchForm();

                expect(testWidget.batchGoBtn.disabled).toBe(true);
            });
        });
        describe('addRow', function () {
            it('adds an object to the store', function () {
                var dataCount = testWidget.store.data.length;

                testWidget.addRow();

                expect(testWidget.store.data.length).toEqual(dataCount + 1);

                var addedRow = testWidget.store.data[testWidget.store.data.length - 1];

                expect(addedRow[fn.PASS_NUM]).toEqual(testWidget.gridTab.currentTab);
            });
            it('adds the correct id number when multiple passes are present', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.gridTab.addTab();

                var addedRow = testWidget.store.data[testWidget.store.data.length - 1];

                expect(addedRow[fn.CATCH_ID]).toBe(1);
            });
            it('adds the correct id if a row is deleted', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.grid.select(testWidget.grid.row(testWidget.store.data[0][fn.FISH_ID]));
                testWidget.deleteRow();

                testWidget.addRow();

                var addedRow = testWidget.store.data[testWidget.store.data.length - 1];

                expect(addedRow[fn.CATCH_ID]).toBe(3);
            });
            it('remembers the species code and length type', function () {
                var existingGuid = testWidget.addRow();
                var existingObject = testWidget.store.getSync(existingGuid);
                var species = 'BlueTrout';
                var lengthType = 'AVeryGoodLengthType';
                existingObject[config.fieldNames.fish.SPECIES_CODE] = species;
                existingObject[config.fieldNames.fish.LENGTH_TYPE] = lengthType;

                var newObject = testWidget.store.getSync(testWidget.addRow());
                expect(newObject[config.fieldNames.fish.SPECIES_CODE]).toBe(species);
                expect(newObject[config.fieldNames.fish.LENGTH_TYPE]).toBe(lengthType);
            });
            it('accepts optional values to populate the row with', function () {
                const species = 'BS';
                const num = '1';
                const lenType = 'STD';
                const id = testWidget.addRow(null, {
                    [FN.SPECIES_CODE]: species,
                    [FN.LENGTH_TYPE]: lenType,
                    [FN.LENGTH]: num,
                    [FN.WEIGHT]: num
                });

                var newObject = testWidget.store.getSync(id);
                expect(newObject[FN.SPECIES_CODE]).toEqual(species);
                expect(newObject[FN.LENGTH_TYPE]).toEqual(lenType);
                expect(newObject[FN.LENGTH]).toEqual(num);
                expect(newObject[FN.WEIGHT]).toEqual(num);
            });
        });
        describe('onAddPass', function () {
            it('saves the store', function () {
                spyOn(testWidget.grid, 'save');

                testWidget.onAddPass({ skipAddRow: true });

                expect(testWidget.grid.save).toHaveBeenCalled();
            });
            it('adds a new row for the new pass', function () {
                spyOn(testWidget, 'addRow');

                testWidget.onAddPass({ skipAddRow: false });

                expect(testWidget.addRow).toHaveBeenCalled();
            });
        });
        describe('onChangePass', function () {
            it('saves the store', function () {
                spyOn(testWidget.grid, 'save');

                testWidget.onChangePass();

                expect(testWidget.grid.save).toHaveBeenCalled();
            });
            it('updates the grid store query', function () {
                spyOn(testWidget.store, 'filter').and.callThrough();
                testWidget.gridTab.currentTab = 2;

                testWidget.onChangePass();

                var expectQuery = {};
                expectQuery[fn.PASS_NUM] = 2;

                expect(testWidget.store.filter).toHaveBeenCalledWith(expectQuery);
            });
        });
        describe('deleteRow', function () {
            it('removes the selected row', function () {
                testWidget.addRow();
                testWidget.addRow();

                testWidget.grid.select(testWidget.grid.row(testWidget.store.data[1][fn.FISH_ID]));

                testWidget.deleteRow();

                expect(testWidget.store.data.length).toBe(2);
            });
        });
        describe('onGridKeydown', function () {
            it('adds a new row if it\'s on the last field of the last row for that pass', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.gridTab.addTab();

                var cell = testWidget.grid.cell(
                    testWidget.store.data[testWidget.store.data.length - 1][fn.FISH_ID],
                    '8').element;
                var e = {
                    keyCode: keys.TAB,
                    target: cell,
                    preventDefault: function () {}
                };

                testWidget.onGridKeydown(e);

                expect(testWidget.store.data.length).toBe(5);
            });
            it('adds a new row on a previous pass', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.gridTab.addTab();
                testWidget.addRow();
                testWidget.gridTab.changeTab({target: {innerText: '1'}});

                var filter = {};
                filter[fn.PASS_NUM] = testWidget.gridTab.currentTab;
                var data = testWidget.store.filter(filter).fetchSync();
                var cell = testWidget.grid.cell(data[data.length - 1][fn.FISH_ID], '8').element;
                var e = {
                    keyCode: keys.TAB,
                    target: cell,
                    preventDefault: function () {}
                };

                testWidget.onGridKeydown(e);

                expect(testWidget.store.data.length).toBe(6);
            });
        });
        describe('batch', function () {
            var weight = 10;
            beforeEach(function () {
                testWidget.batchWeightTxt.value = weight;
            });
            it('rounds weights to one decimal', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.batchWeightTxt.value = 10;

                var data = testWidget.store.data;
                data.forEach(function (d) {
                    d[config.fieldNames.fish.SPECIES_CODE] = 'a';
                });

                testWidget.batch();

                expect(data[0][config.fieldNames.fish.WEIGHT]).toBe(3.3);
                expect(data[1][config.fieldNames.fish.WEIGHT]).toBe(3.3);
                expect(data[2][config.fieldNames.fish.WEIGHT]).toBe(3.3);
            });
            it('clears out the text boxes and hides the popup', function () {
                spyOn(testWidget.batchBtn, 'click');

                testWidget.batch();

                expect(testWidget.batchBtn.click).toHaveBeenCalled();
                expect(testWidget.batchWeightTxt.value).toEqual('');
            });
            it('assigns weights to only those fish without them', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addRow();

                testWidget.batchWeightTxt.value = 9;

                var data = testWidget.store.data;
                data[0][config.fieldNames.fish.WEIGHT] = 5;
                data.forEach(function (d) {
                    d[config.fieldNames.fish.SPECIES_CODE] = 'a';
                });

                testWidget.batch();

                expect(data[0][config.fieldNames.fish.WEIGHT]).toBe(5);
                expect(data[1][config.fieldNames.fish.WEIGHT]).toBe(3);
                expect(data[2][config.fieldNames.fish.WEIGHT]).toBe(3);
                expect(data[3][config.fieldNames.fish.WEIGHT]).toBe(3);
            });
            it('only assigns weights to fish when they are consecutive starting from the bottom up', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addRow();

                testWidget.batchWeightTxt.value = 9;

                var data = testWidget.store.data;
                data[1][config.fieldNames.fish.WEIGHT] = 5;
                data.forEach(function (d) {
                    d[config.fieldNames.fish.SPECIES_CODE] = 'a';
                });

                testWidget.batch();

                expect(data[0][config.fieldNames.fish.WEIGHT]).toBe(null);
                expect(data[1][config.fieldNames.fish.WEIGHT]).toBe(5);
                expect(data[2][config.fieldNames.fish.WEIGHT]).toBe(4.5);
                expect(data[3][config.fieldNames.fish.WEIGHT]).toBe(4.5);
            });
            it('does not affect rows with count > 1', function () {
                testWidget.addRow(null, {
                    [testWidget.COUNT]: 2
                });
                testWidget.addRow();
                testWidget.addRow();

                testWidget.batchWeightTxt.value = 9;

                var data = testWidget.store.data;
                data.forEach(function (d) {
                    d[config.fieldNames.fish.SPECIES_CODE] = 'a';
                });

                testWidget.batch();

                expect(data[0][config.fieldNames.fish.WEIGHT]).toBe(null);
                expect(data[1][config.fieldNames.fish.WEIGHT]).toBe(null);
                expect(data[2][config.fieldNames.fish.WEIGHT]).toBe(4.5);
                expect(data[3][config.fieldNames.fish.WEIGHT]).toBe(4.5);
            });
        });
        describe('moreInfo', function () {
            it('doesn\'t open the dialog if no row is selected', function () {
                spyOn(testWidget, 'getSelectedRow').and.returnValue(undefined);
                spyOn(testWidget.moreInfoDialog, 'show');

                testWidget.moreInfo();

                expect(testWidget.moreInfoDialog.show).not.toHaveBeenCalled();
            });
        });
        describe('isValid', function () {
            it('requires at least one fish to be recorded', function () {
                expect(testWidget.isValid().innerText).toMatch(testWidget.invalidGridMsg);

                testWidget.store.data[0][fn.SPECIES_CODE] = 'blah';
                testWidget.grid.save();

                expect(testWidget.isValid()).toBe(true);
            });
        });
        describe('clear', function () {
            it('clears all of the controls', function (done) {
                testWidget.gridTab.addTab();
                testWidget.store.data[0][fn.SPECIES_CODE] = 'blah';
                testWidget.addRow();
                testWidget.grid.save();
                spyOn(testWidget.moreInfoDialog, 'clearValues');

                testWidget.clear().then(function () {
                    expect(testWidget.getNumberOfPasses()).toBe(1);
                    expect(testWidget.store.data.length).toBe(1);
                    expect(testWidget.store.data[0][fn.SPECIES_CODE]).toEqual(null);
                    expect(testWidget.moreInfoDialog.clearValues).toHaveBeenCalled();

                    done();
                });
            });
        });
        describe('onRowSelected', function () {
            it('set the selectedRow property', function () {
                spyOn(testWidget, '_setSelectedRowAttr');
                var row = {};

                testWidget.onRowSelected({rows: [row]});

                expect(testWidget._setSelectedRowAttr).toHaveBeenCalledWith(row);
            });
        });
        describe('onRowDeselected', function () {
            it('clears the selectedRow property after waiting a bit', function () {
                jasmine.clock().install();

                spyOn(testWidget, '_setSelectedRowAttr');

                testWidget.selectedRow = {};
                testWidget.onRowDeselected();
                testWidget.selectedRow = {};

                jasmine.clock().tick(51);

                expect(testWidget._setSelectedRowAttr).not.toHaveBeenCalled();

                testWidget.onRowDeselected();

                jasmine.clock().tick(51);

                expect(testWidget._setSelectedRowAttr).toHaveBeenCalledWith(null);

                jasmine.clock().uninstall();
            });
        });
        describe('_setSelectedRowAttr', function () {
            it('disables/enables the more info buttons', function () {
                testWidget._setSelectedRowAttr({});

                query('.more-info>a', testWidget.domNode).forEach(function (a) {
                    expect(domClass.contains(a, 'disabled')).toBe(false);
                });

                testWidget._setSelectedRowAttr(null);

                query('.more-info>a', testWidget.domNode).forEach(function (a) {
                    expect(domClass.contains(a, 'disabled')).toBe(true);
                });
            });
        });

        describe('onRemovePass', function () {
            it('removes data associated with the pass from the store grid', function () {
                testWidget.gridTab.addTab();
                testWidget.addRow();

                expect(testWidget.store.fetchSync().length).toBe(3);

                testWidget.onRemovePass({ tabNum: 2 });

                expect(testWidget.store.fetchSync().length).toBe(1);
            });
        });

        describe('getData', function () {
            it('duplicates rows with count > 1', function () {
                const rows = [
                    // fish id, count
                    [1, 1],
                    [2, 1],
                    [3, 5],
                    [4, 1]
                ];

                rows.forEach(row => {
                    const [fishId, count] = row;
                    testWidget.store.addSync({
                        [FN.FISH_ID]: fishId,
                        [FN.EVENT_ID]: 'blah',
                        [FN.PASS_NUM]: 1,
                        [FN.CATCH_ID]: 'blah',
                        [FN.SPECIES_CODE]: 'BT',
                        [FN.LENGTH_TYPE]: null,
                        [FN.LENGTH]: null,
                        [FN.WEIGHT]: null,
                        [testWidget.COUNT]: count,
                        [FN.NOTES]: ''
                    });
                });

                const submissionRows = testWidget.getData();

                expect(submissionRows.length).toBe(9);

                // make sure that unique fish ids were created
                const uniqueIds = submissionRows.reduce((set, nextRow) => {
                    set.add(nextRow[FN.FISH_ID]);

                    return set;
                }, new Set());
                expect(uniqueIds.size).toBe(9);

                expect(submissionRows[0][testWidget.COUNT]).toBeUndefined();
            });
            it('batch weights for duplicate rows', function () {
                const averageCatchID = 'averageCatch';
                const rows = [
                    // fish id, weight, count, catchID
                    [1, 1, 1, 'blah'],
                    [2, 2, 1, 'blah'],
                    [3, 10, 3, averageCatchID],
                    [4, 4, 1, 'blah']
                ];

                rows.forEach(row => {
                    const [fishId, weight, count, catchID] = row;
                    testWidget.store.addSync({
                        [FN.FISH_ID]: fishId,
                        [FN.EVENT_ID]: 'blah',
                        [FN.PASS_NUM]: 1,
                        [FN.CATCH_ID]: catchID,
                        [FN.SPECIES_CODE]: 'BT',
                        [FN.LENGTH_TYPE]: null,
                        [FN.LENGTH]: null,
                        [FN.WEIGHT]: weight,
                        [testWidget.COUNT]: count,
                        [FN.NOTES]: ''
                    });
                });

                const submissionRows = testWidget.getData();

                submissionRows.forEach(row => {
                    if (row[FN.CATCH_ID] === averageCatchID) {
                        expect(row[FN.WEIGHT]).toBeCloseTo(3.33, 2);
                    }
                });
            });
        });
    });
});
