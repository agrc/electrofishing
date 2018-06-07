define([
    'agrc/modules/Formatting',

    'app/catch/FilteringSelectForGrid',
    'app/catch/MoreInfoDialog',
    'app/config',
    'app/Domains',
    'app/GridTab',
    'app/_GridMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/aspect',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/on',
    'dojo/query',
    'dojo/store/Memory',
    'dojo/text!app/catch/templates/BulkUploadHelp.html',
    'dojo/text!app/catch/templates/Catch.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

    'localforage',

    'papaparse/papaparse',

    'bootstrap'
], function (
    Formatting,

    FilteringSelectForGrid,
    MoreInfoDialog,
    config,
    Domains,
    GridTab,
    _GridMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    aspect,
    domClass,
    domConstruct,
    on,
    query,
    Memory,
    bulkHelpHTML,
    template,
    topic,
    array,
    declare,
    lang,

    generateRandomUuid,

    localforage,

    papaparse
) {
    const FN = config.fieldNames.fish;

    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GridMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'catch',


        // moreInfoDialog: app/catch/MoreInfoDialog
        moreInfoDialog: null,

        // skipNumber: Number
        //      The number of fields to skip when you tab at the end of the row
        //      This is to skip over the hidden fields
        //      required for _GridMixin
        skipNumber: 6,

        // lastColumn: String
        //      required for _GridMixin
        lastColumn: null,

        // firstColumn: String
        //      required for _GridMixin
        firstColumn: null,

        // idProperty: String
        //      required for _GridMixin
        idProperty: null,

        // ignoreColumn: String
        //      required for _GridMixin
        ignoreColumn: null,

        // invalidGridMsg: String
        //      returned by isValid if there are no fish recorded
        invalidGridMsg: 'You must input at least one fish.',

        // cacheId: String
        //      used to cache inprogress data
        cacheId: 'app/catch/catch',

        // gridTab: GridTab
        gridTab: null,

        // inprogress cached data for this object
        // {
        //     numPasses: number,
        //     gridData: object[]
        // }

        // COUNT: string
        //      name of the Count field in the grid
        COUNT: 'COUNT',

        constructor: function () {
            // summary:
            //      sets some properties that cannot be set in the class definition
            //      because config isn't available yet
            console.log('app/catch/Catch:constructor', arguments);

            var fn = config.fieldNames.fish;

            this.lastColumn = fn.WEIGHT;
            this.firstColumn = fn.SPECIES_CODE;
            this.idProperty = fn.FISH_ID;
            this.ignoreColumn = config.fieldNames.MOREINFO;
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/catch/Catch:postCreate', arguments);

            this.gridTab = new GridTab({ name: 'Pass' }, this.gridTabDiv);
            this.gridTab.startup();
            this.gridTab.on('change-tab', this.onChangePass.bind(this));
            this.gridTab.on('add-tab', this.onAddPass.bind(this));
            this.gridTab.on('remove-tab', this.onRemovePass.bind(this));

            var fn = config.fieldNames.fish;
            var columns = [
                {label: 'FISH_ID', field: fn.FISH_ID, sortable: false},
                {label: 'EVENT_ID', field: fn.EVENT_ID, sortable: false},
                {label: 'PASS_NUM', field: fn.PASS_NUM, sortable: false},
                {label: 'NOTES', field: fn.NOTES, sortable: false},
                {label: 'ID', field: fn.CATCH_ID, sortable: false},
                {
                    autoSave: true,
                    label: 'Species Code',
                    field: fn.SPECIES_CODE,
                    editor: FilteringSelectForGrid,
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        domainFieldName: fn.SPECIES_CODE,
                        domainLayerUrl: config.urls.fishFeatureService,
                        parentId: this.id,
                        columnIndex: 5
                    }
                }, {
                    autoSave: true,
                    label: 'Length Type',
                    field: fn.LENGTH_TYPE,
                    editor: FilteringSelectForGrid,
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        domainFieldName: fn.LENGTH_TYPE,
                        domainLayerUrl: config.urls.fishFeatureService,
                        parentId: this.id,
                        columnIndex: 6
                    }
                }, {
                    autoSave: true,
                    label: 'Length (millimeters)',
                    field: fn.LENGTH,
                    editor: this.NewNumberSpinner,
                    sortable: false,
                    autoSelect: true,
                    editOn: 'focus',
                    editorArgs: {
                        constraints: {
                            min: 0
                        }
                    }
                }, {
                    autoSave: true,
                    label: 'Weight (grams)',
                    field: fn.WEIGHT,
                    editor: this.NewNumberSpinner,
                    sortable: false,
                    autoSelect: true,
                    editOn: 'focus',
                    editorArgs: {
                        constraints: {
                            min: 0
                        }
                    }
                }, {
                    autoSave: true,
                    label: 'Count',
                    field: this.COUNT,
                    editor: this.NewNumberSpinner,
                    sortable: false,
                    autoSelect: true,
                    editOn: 'focus',
                    editorArgs: {
                        constraints: {
                            min: 1
                        }
                    }
                }
            ];

            this.initGrid(columns);
            var that = this;
            aspect.after(this.grid, 'renderRow', function (row, args) {
                if (args[0][config.fieldNames.MOREINFO]) {
                    domClass.add(row, 'bold');
                }

                return row;
            });
            this.addRow();

            $(this.batchBtn).popover({
                html: true,
                content: this.batchForm,
                placement: 'bottom',
                container: 'body'
            });

            this.moreInfoDialog = new MoreInfoDialog({
                catch: this
            }, this.moreInfoDialogDiv);
            this.moreInfoDialog.startup();

            $('a[href="#catchTab"]').on('shown.bs.tab', function () {
                that.grid.startup();
            });
            $('a[href="#catchTab"]').on('hidden.bs.tab', function () {
                $(that.batchBtn).popover('hide');
            });

            if (!window.jasmine) {
                localforage.getItem(this.cacheId).then(function (inProgressData) {
                    if (inProgressData) {
                        if (inProgressData.gridData) {
                            that.setGridData(inProgressData.gridData);
                            that.grid.refresh();
                        }

                        if (inProgressData.numPasses > 1) {
                            for (var i = 1; i < inProgressData.numPasses; i++) {
                                that.gridTab.addTab(true);
                            }
                        }
                    }
                    that.store.on('add, update, delete', lang.hitch(that, 'cacheInProgressData'));
                });
            }

            this.wireBatchFormEvents();

            $(this.bulkUploadHelp).popover({
                title: 'Bulk Upload Help',
                content: lang.replace(bulkHelpHTML, fn),
                html: true,
                placement: 'left',
                trigger: 'focus'
            });
        },
        wireBatchFormEvents: function () {
            // summary:
            //      wires events for the widget
            console.log('app/catch/Catch:wireBatchFormEvents', arguments);

            this.own(
                on(this.batchWeightTxt, 'keyup, change', lang.hitch(this, 'validateBatchForm'))
            );
        },
        addRow: function (overrides = {}) {
            // summary
            //      Adds a new empty row to the grid with the appropriate
            //      pass number and a new guid
            // returns: String
            //      The guid of the newly added row. Mostly for unit tests.
            console.log('app/catch/Catch:addRow', arguments);

            var fn = config.fieldNames.fish;
            var passFilter = {};
            passFilter[fn.PASS_NUM] = this.gridTab.currentTab;
            var passData = this.store.filter(passFilter).fetchSync();
            var lastRow = passData[passData.length - 1];
            var catchId = 1;
            var lastSpecies = null;
            var lastLengthType = null;
            if (passData.length > 0) {
                catchId = lastRow[fn.CATCH_ID] + 1;
                lastSpecies = lastRow[fn.SPECIES_CODE];
                lastLengthType = lastRow[fn.LENGTH_TYPE];
            }
            var row = {
                [fn.FISH_ID]: this.getNewFishId(),
                [fn.EVENT_ID]: config.eventId,
                [fn.PASS_NUM]: this.gridTab.currentTab,
                [fn.CATCH_ID]: catchId,
                [fn.SPECIES_CODE]: lastSpecies,
                [fn.LENGTH_TYPE]: lastLengthType,
                [fn.LENGTH]: null,
                [fn.WEIGHT]: null,
                [this.COUNT]: 1,
                [fn.NOTES]: ''
            };

            row = Object.assign(row, overrides);

            this.store.addSync(row);

            this.grid.focus(this.grid.cell(row[fn.FISH_ID], '5'));

            return row[fn.FISH_ID];
        },
        getNewFishId() {
            // summary
            //      returns a new fish id string
            // returns: string
            console.log('app/catch/Catch:getNewFishId', arguments);

            return '{' + generateRandomUuid() + '}';
        },
        onAddPass: function (event) {
            // summary:
            //      adds a new pass and updates the grid store query
            // event: Event Object
            console.log('app/catch/Catch:onAddPass', arguments);

            this.grid.save();

            if (!event.skipAddRow) {
                this.addRow();

                this.cacheInProgressData();
            }
        },
        onRemovePass: function (event) {
            // summary:
            //      removes the associated pass data from the grid and more info dialog data
            // event: Event Object
            console.log('app/catch/Catch:onRemovePass', arguments);

            this.store.filter(this.getPassFilter(event.tabNum)).forEach(item => {
                this.moreInfoDialog.removeFish(item[this.idProperty]);
                this.store.removeSync(item[this.idProperty]);
            });
        },
        getPassFilter: function (passNum) {
            // summary:
            //      returns an object suitable to pass to store.filter that filters the data
            //      by the passed in pass number
            // passNum: Number
            console.log('app/catch/Catch:getPassFilter', arguments);

            return {
                [config.fieldNames.fish.PASS_NUM]: passNum
            };
        },
        cacheInProgressData: function () {
            // summary:
            //      caches the number of passes and grid data
            console.log('app/catch/Catch:cacheInProgressData', arguments);

            var fn = config.fieldNames.fish;
            var storeItems = this.store.fetchSync();
            storeItems.forEach(function (item) {
                if (item[fn.LENGTH] < 1 || isNaN(item[fn.LENGTH])) {
                    item[fn.LENGTH] = null;
                }

                if (item[fn.WEIGHT] < 1 || isNaN(item[fn.WEIGHT])) {
                    item[fn.WEIGHT] = null;
                }
            });

            localforage.setItem(this.cacheId, {
                numPasses: this.getNumberOfPasses(),

                // The JSON stringify/parse is to strip out the extra methods that dstore
                // adds to the array returned from fetchSync. This messes up localforage.
                gridData: JSON.parse(JSON.stringify(storeItems))
            });
        },
        onChangePass: function () {
            // summary:
            //      fires when a user clicks on a pass button
            //      updates the query on the grid store to show only the appropriate
            //      fish
            console.log('app/catch/Catch:onChangePass', arguments);

            this.grid.save();

            this.grid.set('collection', this.store.filter(this.getPassFilter(this.gridTab.currentTab)));
        },
        getNumberOfPasses: function () {
            // summary:
            //      returns the number of passes
            // returns: Number
            console.log('app/catch/Catch:getNumberOfPasses', arguments);

            return this.gridTab.getNumberOfTabs();
        },
        validateBatchForm: function () {
            // summary:
            //      enables/disabled go button on batch form
            console.log('app/catch/Catch:validateBatchForm', arguments);

            var value = parseFloat(this.batchWeightTxt.value);
            this.batchGoBtn.disabled = isNaN(value) || value === 0;
        },
        batch: function () {
            // summary:
            //      description
            // e: Click Event
            console.log('app/catch/Catch:batch', arguments);

            var batchWeight = parseInt(this.batchWeightTxt.value, 10);
            var fn = config.fieldNames.fish;

            // get a new array instance so that pop doesn't mess with the original data
            var data = this.grid.collection.fetchSync().slice();

            // check to see if last row in grid is empty
            var lastRow = data[data.length - 1];
            if (lastRow[fn.SPECIES_CODE] === null) {
                data.pop();
            }

            var affectedRows = [];
            var item = data.pop();
            while (item && !item[fn.WEIGHT]) {
                affectedRows.push(item);
                item = data.pop();
            }

            var that = this;
            var avgWeight = Formatting.round(batchWeight / affectedRows.length, 1);
            var populateValues = function (guid) {
                var modifyItem = that.store.getSync(guid);
                modifyItem[fn.WEIGHT] = (typeof avgWeight === 'number' && !isNaN(avgWeight)) ? avgWeight : '0';
                that.store.putSync(modifyItem);
            };

            affectedRows.forEach(function (row) {
                populateValues(row[fn.FISH_ID]);
            });

            // hide popup and clear values except species code
            this.batchBtn.click();
            this.batchWeightTxt.value = '';

            this.grid.save();
            this.grid.refresh();
            this.grid.scrollTo({y: 9999999}); // scroll to the bottom of the grid
        },
        onBatchToggle: function () {
            // summary:
            //      description
            console.log('app/catch/Catch:onBatchToggle', arguments);

            this.batchWeightTxt.focus();
        },
        moreInfo: function (evt) {
            // summary:
            //     opens the more info dialog
            // evt: Mouse Click Event Object
            console.log('app/catch/Catch:moreInfo', arguments);

            var row = this.getSelectedRow();

            if (row) {
                this.moreInfoDialog.show(row.data[config.fieldNames.fish.FISH_ID],
                    evt.target.dataset.tab);
            }
        },
        clear: function () {
            // summary:
            //      clears all data associated with this widget and it's child widgets
            console.log('app/catch/Catch:clear', arguments);
            this.numPasses = 1;
            var that = this;

            return localforage.removeItem(this.cacheId).then(function () {
                that.gridTab.clear();
                that.clearGrid();
                that.moreInfoDialog.clear();
            });
        },
        isValid: function () {
            // summary:
            //      validates this tab
            // returns: String (if not valid) | Boolean (true if valid)
            console.log('app/catch/Catch:isValid', arguments);

            return this.isGridValid();
        },
        getData: function () {
            // summary:
            //      packages up the grid data as a record set
            console.log('app/catch/Catch:getData', arguments);

            return this.getGridData().reduce((expandedRows, nextRow) => {
                let count = nextRow[this.COUNT];
                delete nextRow[this.COUNT];
                if (count === 1) {
                    expandedRows.push(nextRow);
                } else {
                    while (count > 0) {
                        nextRow[FN.FISH_ID] = this.getNewFishId();

                        expandedRows.push(lang.clone(nextRow));

                        count = count - 1;
                    }
                }

                return expandedRows;
            }, []);
        },
        _setSelectedRowAttr: function (row) {
            // summary:
            //      overridden from _GridMixin
            // row: _Row
            console.log('app/catch/Catch:_setSelectedRowAttr', arguments);

            var value = (row) ? domClass.remove : domClass.add;

            query('.more-info>a', this.domNode).forEach(function (a) {
                value(a, 'disabled');
            });

            this.inherited(arguments);
        },
        destroyRecursive: function () {
            // summary:
            //      overriden to hide batch form
            // param or return
            console.log('app/catch/Catch:destroyRecursive', arguments);

            $(this.batchBtn).popover('hide');

            this.inherited(arguments);
        },
        onBulkUploadClick: function (event) {
            // summary:
            //
            // event: Event Object
            console.log('app/catch/Catch:onBulkUploadClick', arguments);

            const fileInput = event.target;

            papaparse.parse(fileInput.files[0], {
                complete: this.bulkUpload.bind(this),
                header: true,
                skipEmptyLines: true
            });

            // clear files so that the onchange event fires again if they upload the same file
            fileInput.value = '';
        },
        bulkUpload: function (parseResults) {
            // summary:
            //      description
            // parseResults: Result Object returned from papaparse.parse
            console.log('app/catch/Catch:bulkUpload', arguments);

            if (parseResults.errors.length) {
                console.error(JSON.stringify(parseResults.errors));
                topic.publish(config.topics.toaster, 'Error parsing CSV: ' +
                    parseResults.errors.map(e => e.message).join('\n'));

                return;
            }

            // remove the last row if it's blank
            const visibleGridData = this.grid.collection.fetchSync();
            const lastRow = visibleGridData[visibleGridData.length - 1];
            const fields = [FN.SPECIES_CODE, FN.LENGTH_TYPE, FN.LENGTH, FN.WEIGHT];
            if (lastRow && fields.every(field => lastRow[field] === null)) {
                console.log('removed first row');
                this.store.removeSync(lastRow[this.idProperty]);
            }

            parseResults.data.forEach(data => this.addRow(data));

            this.grid.refresh();
        },
        deleteRow() {
            // summary:
            //      overriden from _GridMixin to add the removal of the fish from the more info dialog
            console.log('app/catch/Catch', arguments);

            const selectedRow = this.getSelectedRow();

            this.moreInfoDialog.removeFish(selectedRow.data[FN.FISH_ID]);

            this.inherited(arguments);
        }
    });
});
