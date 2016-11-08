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

                expect(addedRow[fn.PASS_NUM]).toEqual(testWidget.currentPass);
            });
            it('adds the correct id number when multiple passes are present', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addPass();

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

                console.log(testWidget.store.data);
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
        });
        describe('addPass', function () {
            it('saves the store', function () {
                spyOn(testWidget.grid, 'save');

                testWidget.addPass();

                expect(testWidget.grid.save).toHaveBeenCalled();
            });
            it('adds a new pass button', function () {
                var origPass = testWidget.currentPass;

                testWidget.addPass();

                expect(query('div[data-dojo-attach-point="passBtnContainer"] .btn', testWidget.domNode).length).toBe(2);
                expect(testWidget.currentPass).toEqual(origPass + 1);
            });
            it('calls changePass on the newly created button', function () {
                spyOn(testWidget, 'changePass');

                testWidget.addPass();

                expect(testWidget.changePass.calls.mostRecent().args[0].target.innerText).toBe('2');
            });
            it('adds a new row for the new pass', function () {
                spyOn(testWidget, 'addRow');

                testWidget.addPass();

                expect(testWidget.addRow).toHaveBeenCalled();
            });
            it('adds the correct number even if the pass with the highest number isnt selected', function () {
                spyOn(testWidget, 'changePass');

                testWidget.addPass();

                testWidget.currentPass = 1;

                testWidget.addPass();

                expect(testWidget.changePass.calls.mostRecent().args[0].target.innerText).toBe('3');
            });
        });
        describe('changePass', function () {
            var e = {
                target: {innerText: '2'}
            };
            it('saves the store', function () {
                spyOn(testWidget.grid, 'save');

                testWidget.changePass(e);

                expect(testWidget.grid.save).toHaveBeenCalled();
            });
            it('updates the grid store query', function () {
                spyOn(testWidget.store, 'filter').and.callThrough();

                testWidget.changePass(e);

                var query = {};
                query[fn.PASS_NUM] = 2;

                expect(testWidget.store.filter).toHaveBeenCalledWith(query);
            });
            it('updates the current pass', function () {
                testWidget.changePass(e);

                expect(testWidget.currentPass).toBe(2);
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
                testWidget.addPass();

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
                testWidget.addPass();
                testWidget.addRow();
                testWidget.changePass({target: {innerText: '1'}});

                var filter = {};
                filter[fn.PASS_NUM] = testWidget.currentPass;
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
            it('only assigns weights to fish without them that are consecutive starting from the bottom up', function () {
                testWidget.addRow()
                testWidget.addRow()
                testWidget.addRow()

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
        });
        describe('specialWeight', function () {
            it('apply the special weight to the selected row', function () {
                testWidget.addRow();
                testWidget.addRow();

                var row = testWidget.grid.row(testWidget.store.data[2][fn.FISH_ID]);
                testWidget.grid.select(row);
                var weight = -1;

                testWidget.specialWeight(weight);

                expect(row.data[fn.WEIGHT]).toEqual(weight);
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
                expect(testWidget.isValid()).toEqual(testWidget.invalidGridMsg);

                testWidget.store.data[0][fn.SPECIES_CODE] = 'blah';
                testWidget.grid.save();

                expect(testWidget.isValid()).toBe(true);
            });
        });
        describe('getNumberOfPasses', function () {
            it('returns the correct number of passes', function () {
                expect(testWidget.getNumberOfPasses()).toEqual(1);

                testWidget.addPass();
                testWidget.addPass();

                expect(testWidget.getNumberOfPasses()).toEqual(3);
            });
        });
        describe('clear', function () {
            it('clears all of the controls', function (done) {
                testWidget.addPass();
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
    });
});
