require([
    'app/catch/Catch',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/query',
    'dojo/keys',
    'dojo/on',
    'dojo/dom-class'

],

function (
    Catch,
    domConstruct,
    win,
    query,
    keys,
    on,
    domClass
    ) {
    describe('app/catch/Catch', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroyRecursive();
            widget = null;
        };
        var fn = AGRC.fieldNames.fish;
        AGRC.eventId = 'blah';
        beforeEach(function () {
            testWidget = new Catch({}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(Catch));
        });
        describe('postCreate', function () {
            it('should initialize an empty row', function () {
                expect(testWidget.grid.collection.data.length).toBe(1);

                var f = testWidget.grid.collection.data[0];

                expect(f[fn.EVENT_ID]).not.toBeNull();
            });
            it('wire up keyup events on batch form for validation', function () {
                spyOn(testWidget, 'validateBatchForm');

                $(testWidget.batchCodeSelect).combobox();
                testWidget.wireEvents();
                var tb = testWidget.batchCodeSelect.parentElement.children[1].children[1].children[0];
                on.emit(tb, 'keyup', {bubbles: true});
                on.emit(tb, 'change', {bubbles: true});
                on.emit(testWidget.batchNumberTxt, 'keyup', {bubbles: true});
                on.emit(testWidget.batchNumberTxt, 'change', {bubbles: true});

                expect(testWidget.validateBatchForm.callCount).toBe(4);
            });
        });
        describe('validateBatchForm', function () {
            it('enables the button if code and number are present', function () {
                domConstruct.create('option', {
                    value: 'blah',
                    innerHTML: 'blah'
                }, testWidget.batchCodeSelect);
                $(testWidget.batchCodeSelect).combobox();

                testWidget.batchNumberTxt.value = 4;
                testWidget.batchCodeSelect.value = 'blah';

                testWidget.validateBatchForm();

                expect(testWidget.batchGoBtn.disabled).toBe(false);

                testWidget.batchNumberTxt.value = '';

                testWidget.validateBatchForm();

                expect(testWidget.batchGoBtn.disabled).toBe(true);
            });
        });
        describe('addRow', function () {
            it('adds an object to the store', function () {
                var dataCount = testWidget.grid.collection.data.length;

                testWidget.addRow();

                expect(testWidget.grid.collection.data.length).toEqual(dataCount + 1);

                var addedRow = testWidget.grid.collection.data[testWidget.grid.collection.data.length - 1];

                expect(addedRow[fn.PASS_NUM]).toEqual(testWidget.currentPass);
            });
            it('adds the correct id number when multiple passes are present', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addPass();

                var addedRow = testWidget.grid.collection.data[testWidget.grid.collection.data.length - 1];

                expect(addedRow[fn.CATCH_ID]).toBe(1);
            });
            it('adds the correct id if a row is deleted', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.grid.select(testWidget.grid.row(testWidget.grid.collection.data[0][fn.FISH_ID]));
                testWidget.deleteRow();

                testWidget.addRow();

                var addedRow = testWidget.grid.collection.data[testWidget.grid.collection.data.length - 1];

                console.log(testWidget.grid.collection.data);
                expect(addedRow[fn.CATCH_ID]).toBe(3);
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

                expect(testWidget.changePass.mostRecentCall.args[0].srcElement.innerText).toBe('2');
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

                expect(testWidget.changePass.mostRecentCall.args[0].srcElement.innerText).toBe('3');
            });
        });
        describe('changePass', function () {
            var e = {
                srcElement: {innerText: '2'}
            };
            it('saves the store', function () {
                spyOn(testWidget.grid, 'save');

                testWidget.changePass(e);

                expect(testWidget.grid.save).toHaveBeenCalled();
            });
            it('updates the grid store query', function () {
                testWidget.changePass(e);

                var query = {};
                query[fn.PASS_NUM] = 2;

                expect(testWidget.grid.query).toEqual(query);
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

                testWidget.grid.select(testWidget.grid.row(testWidget.grid.collection.data[1][fn.FISH_ID]));

                testWidget.deleteRow();

                expect(testWidget.grid.collection.data.length).toBe(2);
            });
        });
        describe('onGridKeydown', function () {
            it('adds a new row if it\'s on the last field of the last row for that pass', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addPass();

                var cell = testWidget.grid.cell(
                    testWidget.grid.collection.data[testWidget.grid.collection.data.length - 1][fn.FISH_ID],
                    '8').element;
                var e = {
                    keyCode: keys.TAB,
                    srcElement: cell,
                    preventDefault: function () {}
                };

                testWidget.onGridKeydown(e);

                expect(testWidget.grid.collection.data.length).toBe(5);
            });
            it('adds a new row on a previous pass', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addPass();
                testWidget.addRow();
                testWidget.changePass({srcElement: {innerText: '1'}});

                var cell = testWidget.grid.cell(
                    testWidget.grid.collection.query(testWidget.grid.query)
                        [testWidget.grid.collection.query(testWidget.grid.query).length - 1]
                        [fn.FISH_ID], '8').element;
                var e = {
                    keyCode: keys.TAB,
                    srcElement: cell,
                    preventDefault: function () {}
                };

                testWidget.onGridKeydown(e);

                expect(testWidget.grid.collection.data.length).toBe(6);
            });
        });
        describe('batch', function () {
            var code = 'BG';
            var number = 5;
            var weight = 10;
            beforeEach(function () {
                domConstruct.create('option', {
                    value: code,
                    innerHTML: code
                }, testWidget.batchCodeSelect);
                testWidget.batchCodeSelect.value = code;
                testWidget.batchNumberTxt.value = number;
                testWidget.batchWeightTxt.value = weight;
            });
            it('adds the appropriate number of rows and values', function () {
                testWidget.batch();

                var data = testWidget.grid.collection.data;

                expect(data.length).toBe(number);
                var first = data[0];
                expect(first[AGRC.fieldNames.fish.SPECIES_CODE]).toBe(code);
                expect(first[AGRC.fieldNames.fish.LENGTH_TYPE]).toBeNull();
                expect(first[AGRC.fieldNames.fish.LENGTH]).toBeNull();
                expect(first[AGRC.fieldNames.fish.WEIGHT]).toBe(2);

                var last = data[4];
                expect(last[AGRC.fieldNames.fish.SPECIES_CODE]).toBe(code);
                expect(last[AGRC.fieldNames.fish.LENGTH_TYPE]).toBeNull();
                expect(last[AGRC.fieldNames.fish.LENGTH]).toBeNull();
                expect(last[AGRC.fieldNames.fish.WEIGHT]).toBe(2);
            });
            it('appends rows to grid with existing rows', function () {
                testWidget.grid.collection.data[0][AGRC.fieldNames.fish.SPECIES_CODE] = 'BH';

                testWidget.addRow();
                testWidget.grid.collection.data[1][AGRC.fieldNames.fish.SPECIES_CODE] = 'BH';

                testWidget.addRow();
                testWidget.grid.collection.data[2][AGRC.fieldNames.fish.SPECIES_CODE] = 'BH';

                testWidget.batch();

                var data = testWidget.grid.collection.data;

                expect(data.length).toBe(8);
            });
            it('adds rows without a weight', function () {
                testWidget.batchWeightTxt.value = '';

                testWidget.batch();

                var data = testWidget.grid.collection.data;

                var last = data[4];
                expect(last[AGRC.fieldNames.fish.WEIGHT]).toBe('0');
            });
            it('rounds weights to one decimal', function () {
                testWidget.batchWeightTxt.value = 10;
                testWidget.batchNumberTxt.value = 3;

                testWidget.batch();

                var data = testWidget.grid.collection.data;

                var last = data[2];
                expect(last[AGRC.fieldNames.fish.WEIGHT]).toBe(3.3);
            });
            it('clears out the text boxes and hides the popup', function () {
                spyOn(testWidget.batchBtn, 'click');

                testWidget.batch();

                expect(testWidget.batchBtn.click).toHaveBeenCalled();
                expect(testWidget.batchWeightTxt.value).toEqual('');
                expect(testWidget.batchNumberTxt.value).toEqual('');
            });
        });
        describe('specialWeight', function () {
            it('apply the special weight to the selected row', function () {
                testWidget.addRow();
                testWidget.addRow();

                var row = testWidget.grid.row(testWidget.grid.collection.data[2][fn.FISH_ID]);
                testWidget.grid.select(row);
                var weight = -1;

                testWidget.specialWeight(weight);

                expect(row.data[fn.WEIGHT]).toEqual(weight);
            });
        });
        describe('moreInfo', function () {
            it('doesn\'t open the dialog if no row is selected', function () {
                spyOn(testWidget, 'getSelectedRow').andReturn(undefined);
                spyOn(testWidget.moreInfoDialog, 'show');

                testWidget.moreInfo();

                expect(testWidget.moreInfoDialog.show).not.toHaveBeenCalled();
            });
        });
        describe('isValid', function () {
            it('requires at least one fish to be recorded', function () {
                expect(testWidget.isValid()).toEqual(testWidget.invalidGridMsg);

                testWidget.grid.collection.data[0][fn.SPECIES_CODE] = 'blah';
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
            it('clears all of the controls', function () {
                testWidget.addPass();
                testWidget.grid.collection.data[0][fn.SPECIES_CODE] = 'blah';
                testWidget.addRow();
                testWidget.grid.save();
                spyOn(testWidget.moreInfoDialog, 'clearValues');

                testWidget.clear();

                expect(testWidget.getNumberOfPasses()).toBe(1);
                expect(testWidget.grid.collection.data.length).toBe(1);
                expect(testWidget.grid.collection.data[0][fn.SPECIES_CODE]).toEqual(null);
                expect(testWidget.moreInfoDialog.clearValues).toHaveBeenCalled();
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
                jasmine.Clock.useMock();
                spyOn(testWidget, '_setSelectedRowAttr');

                testWidget.selectedRow = {};
                testWidget.onRowDeselected();
                testWidget.selectedRow = {};

                jasmine.Clock.tick(51);

                expect(testWidget._setSelectedRowAttr).not.toHaveBeenCalled();

                testWidget.onRowDeselected();

                jasmine.Clock.tick(51);

                expect(testWidget._setSelectedRowAttr).toHaveBeenCalledWith(null);
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