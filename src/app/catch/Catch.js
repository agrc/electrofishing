define([
    'agrc/modules/Formatting',

    'app/catch/FilteringSelectForGrid',
    'app/catch/MoreInfoDialog',
    'app/config',
    'app/Domains',
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
    'dojo/text!app/catch/templates/Catch.html',
    'dojo/topic',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang',

    'dojox/uuid/generateRandomUuid',

    'localforage'
], function (
    Formatting,

    FilteringSelectForGrid,
    MoreInfoDialog,
    config,
    Domains,
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
    template,
    topic,
    array,
    declare,
    lang,

    generateRandomUuid,

    localforage
) {
    // summary:
    //      Catch tab
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GridMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'catch',


        // currentPass: Number
        //      The currently selected pass number
        currentPass: 1,

        // numPasses: Number
        //      The total number of passes
        numPasses: 1,

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

        // inprogress cached data for this object
        // {
        //     numPasses: number,
        //     gridData: object[]
        // }


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
                        grid: this.grid
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
                        grid: this.grid
                    }
                }, {
                    autoSave: true,
                    label: 'Length (millimeters)',
                    field: fn.LENGTH,
                    editor: 'text',
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        // dgrid-input is required for dgrid save events
                        'className': 'form-control dgrid-input',
                        type: 'number'
                    }
                }, {
                    autoSave: true,
                    label: 'Weight (grams)',
                    field: fn.WEIGHT,
                    editor: 'text',
                    sortable: false,
                    editOn: 'focus',
                    editorArgs: {
                        'className': 'form-control dgrid-input',
                        type: 'number'
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

            var that = this;
            $('a[href="#catchTab"]').on('shown.bs.tab', function () {
                that.grid.startup();
            });

            this.own(
                topic.subscribe('refocus', function () {
                    for (var id in that.grid.selection) {
                        if (that.grid.selection.hasOwnProperty(id)) {
                            that.grid.edit(that.grid.cell(id, '6'));
                        }
                    }
                })
            );

            localforage.getItem(this.cacheId).then(function (inProgressData) {
                if (inProgressData) {
                    if (inProgressData.gridData) {
                        that.setGridData(inProgressData.gridData);
                        that.grid.refresh();
                    }

                    if (inProgressData.numPasses > 1) {
                        for (var i = 1; i < inProgressData.numPasses; i++) {
                            that.addPass(true);
                        }
                    }
                }
                that.store.on('add, update, delete', lang.hitch(that, 'cacheInProgressData'));
            });

            this.wireBatchFormEvents();
        },
        wireBatchFormEvents: function () {
            // summary:
            //      wires events for the widget
            console.log('app/catch/Catch:wireBatchFormEvents', arguments);

            this.own(
                on(this.batchWeightTxt, 'keyup, change', lang.hitch(this, 'validateBatchForm'))
            );
        },
        addRow: function () {
            // summary
            //      Adds a new empty row to the grid with the appropriate
            //      pass number and a new guid
            // returns: String
            //      The guid of the newly added row. Mostly for unit tests.
            console.log('app/catch/Catch:addRow', arguments);

            var fn = config.fieldNames.fish;
            var passFilter = {};
            passFilter[fn.PASS_NUM] = this.currentPass;
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
            var row = {};

            row[fn.FISH_ID] = '{' + generateRandomUuid() + '}';
            row[fn.EVENT_ID] = config.eventId;
            row[fn.PASS_NUM] = this.currentPass;
            row[fn.CATCH_ID] = catchId;
            row[fn.SPECIES_CODE] = lastSpecies;
            row[fn.LENGTH_TYPE] = lastLengthType;
            row[fn.LENGTH] = null;
            row[fn.WEIGHT] = null;

            this.store.addSync(row);

            this.grid.focus(this.grid.cell(row[fn.FISH_ID], '5'));

            return row[fn.FISH_ID];
        },
        addPass: function (skipAddRow) {
            // summary:
            //      adds a new pass and updates the grid store query
            // skipAddRow: Boolean
            console.log(this.declaredClass + '::addPass', arguments);

            this.grid.save();

            var lbl = domConstruct.create('label', {
                'class': 'btn btn-primary',
                innerHTML: this.numPasses = this.numPasses + 1,
                onclick: lang.hitch(this, this.changePass)
            }, this.passBtnContainer);
            domConstruct.create('input', {
                type: 'radio',
                name: 'pass'
            }, lbl);

            lbl.click();

            if (!skipAddRow) {
                this.addRow();

                this.cacheInProgressData();
            }
        },
        cacheInProgressData: function () {
            // summary:
            //      caches the number of passes and grid data
            console.log('app/catch/Catch:cacheInProgressData', arguments);

            localforage.setItem(this.cacheId, {
                numPasses: this.numPasses,

                // The JSON stringify/parse is to strip out the extra methods that dstore
                // adds to the array returned from fetchSync. This messes up localforage.
                gridData: JSON.parse(JSON.stringify(this.store.fetchSync()))
            });
        },
        changePass: function (e) {
            // summary:
            //      fires when a user clicks on a pass button
            //      updates the query on the grid store to show only the appropriate
            //      fish
            // e: Click Event
            console.log('app/catch/Catch:changePass', arguments);

            this.currentPass = parseInt(e.target.innerText, 10);

            this.grid.save();

            var query = {};
            query[config.fieldNames.fish.PASS_NUM] = this.currentPass;

            this.grid.set('collection', this.store.filter(query));
        },
        getNumberOfPasses: function () {
            // summary:
            //      returns the number of passes
            // returns: Number
            console.log('app/catch/Catch:getNumberOfPasses', arguments);

            return query('.btn', this.passBtnContainer).length;
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
            var data = Array.from(this.grid.collection.fetchSync());

            // check to see if last row in grid is empty
            var lastRow = data[data.length - 1];
            if (lastRow[fn.SPECIES_CODE] === null) {
                data.pop();
            }

            var affectedRows = [];
            var item = data.pop();
            while (item && !item[fn.WEIGHT]) {
                affectedRows.push(item)
                item = data.pop();
            }

            var that = this;
            var avgWeight = Formatting.round(batchWeight / affectedRows.length, 1);
            var populateValues = function (guid) {
                var modifyItem = that.store.getSync(guid);
                modifyItem[fn.WEIGHT] = (avgWeight === avgWeight) ? avgWeight : '0';
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
        noWeight: function () {
            // summary:
            //      description
            console.log('app/catch/Catch:noWeight', arguments);

            this.specialWeight(config.noWeightValue);
        },
        tooSmall: function () {
            // summary:
            //      description
            console.log('app/catch/Catch:tooSmall', arguments);

            this.specialWeight(config.tooSmallValue);
        },
        specialWeight: function (weight) {
            // summary:
            //      sets the selected row's weight
            // weight: Number
            console.log('app/catch/Catch:specialWeight', arguments);

            this.getSelectedRow().data[config.fieldNames.fish.WEIGHT] = weight;
            this.grid.refresh();
        },
        moreInfo: function (evt) {
            // summary:
            //     opens the more info dialog
            // evt: Mouse Click Event Object
            console.log('app/catch/Catch:moreInfo', arguments);

            var row = this.getSelectedRow();

            if (row) {
                this.moreInfoDialog.show(row.data[config.fieldNames.fish.FISH_ID],
                    evt.target.innerHTML.trim());
            }
        },
        clear: function () {
            // summary:
            //      description
            console.log('app/catch/Catch:clear', arguments);

            var that = this;
            return localforage.removeItem(this.cacheId).then(function () {
                query('.btn', that.passBtnContainer).forEach(function (node) {
                    if (node.innerText.trim() !== '1') {
                        domConstruct.destroy(node);
                    }
                });
                that.changePass({target: {innerText: '1'}});
                that.clearGrid();
                that.moreInfoDialog.clearValues();
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

            return this.getGridData();
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
        }
    });
});
