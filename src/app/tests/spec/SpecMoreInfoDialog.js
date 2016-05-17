require([
    'app/catch/MoreInfoDialog',
    'dojo/dom-construct',
    'dojo/_base/window',
    'dojo/query'

],

function (
    MoreInfoDialog,
    domConstruct,
    win,
    query
    ) {
    describe('app/catch/MoreInfoDialog', function () {
        var testWidget;
        var destroy = function (widget) {
            widget.destroy();
            widget = null;
        };
        var store;
        var guid = 'blah';
        beforeEach(function () {
            var row = {};
            row[AGRC.fieldNames.fish.FISH_ID] = guid;
            row[AGRC.fieldNames.fish.CATCH_ID] = 3;
            row[AGRC.fieldNames.fish.PASS_NUM] = 1;
            store = {
                data: [row],
                get: function () {
                    return this.data[0];
                },
                put: function () {}
            };
            testWidget = new MoreInfoDialog({store: store}, domConstruct.create('div', {}, win.body()));
            testWidget.startup();
        });
        afterEach(function () {
            destroy(testWidget);
        });
        it('create a valid object', function () {
            expect(testWidget).toEqual(jasmine.any(MoreInfoDialog));
        });
        describe('show', function () {
            afterEach(function () {
                testWidget.onCancel(); // hide the dialog
            });
            it('sets the fish and pass id\'s in the dialog title', function () {
                testWidget.show(guid, 'Diet');

                expect(testWidget.catchId.innerHTML).toBe('3');
                expect(testWidget.passId.innerHTML).toBe('1');
            });
            it('sets the current fish id', function () {
                testWidget.show(guid, 'Diet');

                expect(testWidget.currentFishId).toEqual(guid);
            });
            it('shows the passed in tab name', function () {
                testWidget.show(guid, 'Tag');

                expect(query('.tab-pane.in.active', testWidget.domNode)[0].id)
                    .toEqual('Tag_tab');
                expect(query('.nav-tabs li.active a', testWidget.domNode)[0].hash)
                    .toEqual('#Tag_tab');

                testWidget.show(guid, 'Health');

                expect(query('.tab-pane.in.active', testWidget.domNode)[0].id)
                    .toEqual('Health_tab');
                expect(query('.nav-tabs li.active a', testWidget.domNode)[0].hash)
                    .toEqual('#Health_tab');
            });
        });
        describe('onSubmitClick', function () {
            var fn = AGRC.fieldNames.diet;
            var value = 'blah';
            it('gathers the diet grid data', function () {
                testWidget.addRow();
                testWidget.addRow();
                testWidget.addRow();
                var cls = 'blah';
                testWidget.grid.columns[2].editorInstance.values = [{}];
                testWidget.grid.columns[2].editorInstance.values[0].name = cls;
                testWidget.grid.columns[2].editorInstance.values[0].code = cls;
                var msr = 'blah2';
                testWidget.grid.store.data[2][fn.CLASS] = cls;
                testWidget.grid.store.data[2][fn.MEASUREMENT] = msr;
                testWidget.addRow(); // to make sure that it doesn't submit empty rows

                testWidget.onSubmitClick();

                expect(testWidget.getData('diet').features.length).toBe(3);
                expect(testWidget.getData('diet').features[2].attributes[fn.CLASS]).toEqual(cls);
                expect(testWidget.getData('diet').features[2].attributes[fn.MEASUREMENT]).toEqual(msr);
                expect(testWidget.getData('diet').displayFieldName).toEqual('');
            });
            it('gathers the tags data', function () {
                spyOn(testWidget.tagsContainer, 'getData').andReturn([value, value]);

                testWidget.onSubmitClick();

                testWidget.currentFishId = '123123123';
                testWidget.onSubmitClick();

                expect(testWidget.getData('tags').features.length).toEqual(2);
            });
            it('gathers the health data', function () {
                spyOn(testWidget.health, 'getData').andReturn(value);

                testWidget.onSubmitClick();

                testWidget.currentFishId = '123123123';
                testWidget.onSubmitClick();

                testWidget.currentFishId = '543543534';
                testWidget.onSubmitClick();

                expect(testWidget.getData('health').features.length).toEqual(3);
            });
            it('clears the dialog', function () {
                spyOn(testWidget, 'clearValues');

                testWidget.onSubmitClick();

                expect(testWidget.clearValues).toHaveBeenCalled();
            });
        });
        describe('clearValues', function () {
            var fn = AGRC.fieldNames.diet;
            it('clears diet grid', function () {
                testWidget.addRow();
                testWidget.grid.store.data[0][fn.CLASS] = 'blah';
                testWidget.addRow();

                testWidget.clearValues();

                expect(testWidget.grid.store.data.length).toBe(0);
            });
            it('clears any tags', function () {
                spyOn(testWidget.tagsContainer.AddBtnWidgets[0], 'clearValues');
                testWidget.tagsContainer.addAddBtnWidget();

                testWidget.clearValues();

                expect(testWidget.tagsContainer.AddBtnWidgets.length).toBe(1);
            });
            it('clears health values', function () {
                spyOn(testWidget.health, 'clearValues');

                testWidget.clearValues();

                expect(testWidget.health.clearValues).toHaveBeenCalled();
            });
        });
        describe('getData', function () {
            it('returns a record set object', function () {
                testWidget.currentFishId = '123';
                spyOn(testWidget, 'getGridData').andReturn([1]);
                testWidget.onSubmitClick();
                var data = testWidget.getData('diet');

                expect(data.displayFieldName).toEqual('');
                expect(data.features.length).toBe(1);
            });
        });
    });
});
