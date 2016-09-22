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

    'dojox/uuid/generateRandomUuid'
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

    generateRandomUuid
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

        // invalidGridMsg: String
        //      returned by isValid if there are no fish recorded
        invalidGridMsg: 'You must input at least one fish.',

        // fldMoreInfo: String
        //      property name for grid row that has additional info attached to it via the more info dialog


        constructor: function () {
            // summary:
            //      sets some properties that cannot be set in the class definition
            //      because config isn't available yet
            console.log('app/catch/Catch:constructor', arguments);

            var fn = config.fieldNames.fish;

            this.lastColumn = fn.WEIGHT;
            this.firstColumn = fn.SPECIES_CODE;
            this.idProperty = fn.FISH_ID;
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
                    // can't auto save because save causes the row to be redrawn which in turn looses focus
                    // update: This bug has supposedly been fixed: https://github.com/SitePen/dgrid/issues/496#issuecomment-23382688
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

            Domains.populateSelectWithDomainValues(
                this.batchCodeSelect,
                config.urls.fishFeatureService,
                fn.SPECIES_CODE);

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
        },
        wireBatchFormEvents: function () {
            // summary:
            //      wires events for the widget
            console.log('app/catch/Catch:wireBatchFormEvents', arguments);

            var tb = this.batchCodeSelect.parentElement.children[1].children[1].children[0];
            this.own(
                on(tb, 'keyup, change', lang.hitch(this, 'validateBatchForm')),
                on(this.batchNumberTxt, 'keyup, change', lang.hitch(this, 'validateBatchForm'))
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
            var catchId = (passData.length === 0) ? 1 : passData[passData.length - 1][fn.CATCH_ID] + 1;
            var row = {};

            row[fn.FISH_ID] = '{' + generateRandomUuid() + '}';
            row[fn.EVENT_ID] = config.eventId;
            row[fn.PASS_NUM] = this.currentPass;
            row[fn.CATCH_ID] = catchId;
            row[fn.SPECIES_CODE] = null;
            row[fn.LENGTH_TYPE] = null;
            row[fn.LENGTH] = null;
            row[fn.WEIGHT] = null;

            this.store.addSync(row);

            this.grid.focus(this.grid.cell(row[fn.FISH_ID], '5'));

            return row[fn.FISH_ID];
        },
        addPass: function () {
            // summary:
            //      adds a new pass and updates the grid store query
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

            this.addRow();
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

            this.batchGoBtn.disabled = (!this.batchCodeSelect.value ||
                !this.batchNumberTxt.value);
        },
        batch: function () {
            // summary:
            //      description
            // e: Click Event
            console.log('app/catch/Catch:batch', arguments);

            var item;
            var batchWeight = parseInt(this.batchWeightTxt.value, 10);
            var number = parseInt(this.batchNumberTxt.value, 10);
            var that = this;
            var fn = config.fieldNames.fish;
            var avgWeight = Formatting.round(batchWeight / number, 1);
            var populateValues = function (guid) {
                item = that.store.getSync(guid);
                item[fn.SPECIES_CODE] = that.batchCodeSelect.value;
                item[fn.WEIGHT] = (avgWeight === avgWeight) ? avgWeight : '0';
                that.store.putSync(item);
            };

            // check to see if last row in grid is empty
            var data = this.grid.collection.fetchSync();
            var lastRow = data[data.length - 1];
            if (lastRow[fn.SPECIES_CODE] === null) {
                populateValues(lastRow[fn.FISH_ID]);
                number--;
            }

            for (var i = 0; i < number; i++) {
                populateValues(this.addRow());
            }

            // hide popup and clear values except species code
            this.batchBtn.click();
            this.batchWeightTxt.value = '';
            this.batchNumberTxt.value = '';

            this.grid.save();
            this.grid.refresh();
            this.grid.scrollTo({y: 9999999}); // scroll to the bottom of the grid
        },
        onBatchToggle: function () {
            // summary:
            //      description
            console.log('app/catch/Catch:onBatchToggle', arguments);

            var that = this;

            // focus code select
            if (!domClass.contains(that.batchBtn, 'active')) {
                setTimeout(function () {
                    // have to recreate the combobox everytime because it gets trashed
                    // each time that the tooltip is hidden. I think that it has to do with
                    // something calling jquery's cleanData method which strips the combobox
                    // object out of the data dom property for the select
                    $(that.batchCodeSelect).combobox();
                    that.wireBatchFormEvents();
                    that.batchCodeSelect.parentElement.children[1].children[1].children[0].focus();
                }, 200);
            }

            // destroy Comobobox old combobox if there is one
            if (this.batchCodeSelect.parentElement.children.length === 3) {
                domConstruct.destroy(this.batchCodeSelect.parentElement.children[1]);
            }
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

            query('.btn', this.passBtnContainer).forEach(function (node) {
                if (node.innerText.trim() !== '1') {
                    domConstruct.destroy(node);
                }
            });
            this.changePass({target: {innerText: '1'}});
            this.clearGrid();
            this.moreInfoDialog.clearValues();
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
