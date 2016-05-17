define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/catch/templates/Catch.html',
    'agrc/modules/GUID',
    'dojo/dom-class',
    'dojo/dom-construct',
    'dojo/_base/lang',
    'dojo/_base/array',
    'app/catch/MoreInfoDialog',
    'app/_GridMixin',
    'dgrid/editor',
    'app/catch/GridDropdown',
    'dojo/aspect',
    'dojo/query',
    'agrc/modules/Formatting',
    'app/Domains',
    'dojo/on'

],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    GUID,
    domClass,
    domConstruct,
    lang,
    array,
    MoreInfoDialog,
    _GridMixin,
    editor,
    GridDropdown,
    aspect,
    query,
    Formatting,
    Domains,
    on
    ) {
    // summary:
    //      Catch tab
    return declare('app/Catch', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _GridMixin], {
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
        invalidGridMsg: 'You must input at least one fish',


        constructor: function () {
            // summary:
            //      sets some properties that cannot be set in the class definition
            //      because AGRC isn't available yet
            console.log(this.declaredClass + "::constructor", arguments);
            
            var fn = AGRC.fieldNames.fish;

            this.lastColumn = fn.WEIGHT;
            this.firstColumn = fn.SPECIES_CODE;
            this.idProperty = fn.FISH_ID;
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + "::postCreate", arguments);

            var fn = AGRC.fieldNames.fish;
            var columns = [
                {label: 'FISH_ID', field: fn.FISH_ID, sortable: false},
                {label: 'EVENT_ID', field: fn.EVENT_ID, sortable: false},
                {label: 'PASS_NUM', field: fn.PASS_NUM, sortable: false},
                {label: 'NOTES', field: fn.NOTES, sortable: false},
                {label: 'ID', field: fn.CATCH_ID, sortable: false},
                editor({
                    autoSave: true, 
                    // can't auto save because save causes the row to be redrawn which in turn looses focus
                    // update: This bug has supposedly been fixed: https://github.com/SitePen/dgrid/issues/496#issuecomment-23382688
                    label: 'Species Code',
                    field: fn.SPECIES_CODE,
                    editor: GridDropdown,
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        domainFieldName: AGRC.fieldNames.fish.SPECIES_CODE,
                        domainLayerUrl: AGRC.urls.fishFeatureService
                    }
                }),
                editor({
                    autoSave: true, 
                    label: 'Length Type',
                    field: fn.LENGTH_TYPE,
                    editor: GridDropdown,
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        domainFieldName: AGRC.fieldNames.fish.LENGTH_TYPE,
                        domainLayerUrl: AGRC.urls.fishFeatureService
                    }
                }),
                editor({
                    autoSave: true, 
                    label: 'Length (millimeters)',
                    field: fn.LENGTH,
                    editor: 'text',
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        // dgrid-input is required for dgrid save events
                        'className': 'form-control dgrid-input',
                        type: 'number'
                    }
                }),
                editor({
                    autoSave: true, 
                    label: 'Weight (grams)',
                    field: fn.WEIGHT,
                    editor: 'text',
                    sortable: false,
                    editOn: 'dgrid-cellfocusin',
                    editorArgs: {
                        'className': 'form-control dgrid-input',
                        type: 'number'
                    }
                })
            ];

            this.initGrid(columns);
            this.addRow();

            $(this.batchBtn).popover({
                html: true,
                content: this.batchForm,
                placement: 'bottom',
                container: 'body'
            });

            this.moreInfoDialog = new MoreInfoDialog({
                store: this.grid.store
            }, this.moreInfoDialogDiv);
            this.moreInfoDialog.startup();

            Domains.populateSelectWithDomainValues(
                this.batchCodeSelect,
                AGRC.urls.fishFeatureService,
                AGRC.fieldNames.fish.SPECIES_CODE);

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      wires events for the widget
            console.log('app.Catch:wireEvents', arguments);
        
            var tb = this.batchCodeSelect.parentElement.children[1].children[1].children[0];
            on(tb, 'keyup, change', lang.hitch(this, 'validateBatchForm'));
            on(this.batchNumberTxt, 'keyup, change', lang.hitch(this, 'validateBatchForm'));
        },
        addRow: function () {
            // summary
            //      Adds a new empty row to the grid with the appropriate
            //      pass number and a new guid
            // returns: String
            //      The guid of the newly added row. Mostly for unit tests.
            console.log(this.declaredClass + "::addRow", arguments);
            
            var fn = AGRC.fieldNames.fish;
            var passData = this.grid.store.query(this.grid.query);
            var catchId = (passData.length === 0) ? 1 : passData[passData.length - 1][fn.CATCH_ID] + 1;
            var row = {};

            row[fn.FISH_ID] = GUID.uuid();
            row[fn.EVENT_ID] = AGRC.eventId;
            row[fn.PASS_NUM] = this.currentPass;
            row[fn.CATCH_ID] = catchId;
            row[fn.SPECIES_CODE] = null;
            row[fn.LENGTH_TYPE] = null;
            row[fn.LENGTH] = null;
            row[fn.WEIGHT] = null;

            this.grid.store.add(row);

            this.grid.focus(this.grid.cell(row[fn.FISH_ID], '5'));

            return row[fn.FISH_ID];
        },
        addPass: function () {
            // summary:
            //      adds a new pass and updates the grid store query
            console.log(this.declaredClass + "::addPass", arguments);
        
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
            console.log(this.declaredClass + "::changePass", arguments);

            this.currentPass = parseInt(e.srcElement.innerText, 10);
        
            this.grid.save();

            var query = {};
            query[AGRC.fieldNames.fish.PASS_NUM] = this.currentPass;

            this.grid.set('query', query);
        },
        getNumberOfPasses: function () {
            // summary:
            //      returns the number of passes
            // returns: Number
            console.log(this.declaredClass + "::getNumberOfPasses", arguments);
        
            return query('.btn', this.passBtnContainer).length;
        },
        validateBatchForm: function () {
            // summary:
            //      enables/disabled go button on batch form
            console.log('app.Catch:validateBatchForm', arguments);
        
            this.batchGoBtn.disabled = (!this.batchCodeSelect.value || 
                !this.batchNumberTxt.value);
        },
        batch: function () {
            // summary:
            //      description
            // e: Click Event
            console.log(this.declaredClass + "::batch", arguments);

            var item;
            var batchWeight = parseInt(this.batchWeightTxt.value, 10);
            var number = parseInt(this.batchNumberTxt.value, 10);
            var that = this;
            var populateValues = function (guid) {
                item = that.grid.store.get(guid);
                item[fn.SPECIES_CODE] = that.batchCodeSelect.value;
                item[fn.WEIGHT] = (avgWeight === avgWeight) ? avgWeight : '0';
                that.grid.store.put(item);
            };

            var avgWeight = Formatting.round(batchWeight / number, 1);
            var fn = AGRC.fieldNames.fish;

            // check to see if last row in grid is empty
            var lastRow = this.grid.store.data[this.grid.store.data.length - 1];
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
            console.log(this.declaredClass + "::onBatchToggle", arguments);

            var that = this;

            // focus code select
            if (!domClass.contains(that.batchBtn, 'active')) {
                setTimeout(function () {
                    // have to recreate the combobox everytime because it gets trashed
                    // each time that the tooltip is hidden. I think that it has to do with
                    // something calling jquery's cleanData method which strips the combobox
                    // object out of the data dom property for the select
                    $(that.batchCodeSelect).combobox();
                    that.wireEvents();
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
            console.log(this.declaredClass + "::noWeight", arguments);
        
            this.specialWeight(AGRC.noWeightValue);
        },
        tooSmall: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::tooSmall", arguments);
        
            this.specialWeight(AGRC.tooSmallValue);
        },
        specialWeight: function (weight) {
            // summary:
            //      sets the selected row's weight
            // weight: Number
            console.log(this.declaredClass + "::specialWeight", arguments);
        
            this.getSelectedRow().data[AGRC.fieldNames.fish.WEIGHT] = weight;
            this.grid.refresh();
        },
        moreInfo: function (evt) {
            // summary:
            //     opens the more info dialog
            // evt: Mouse Click Event Object 
            console.log(this.declaredClass + "::moreInfo", arguments);
            
            var row = this.getSelectedRow();

            if (row) {
                this.moreInfoDialog.show(row.data[AGRC.fieldNames.fish.FISH_ID],
                    evt.srcElement.innerHTML.trim());
            }
        },
        clear: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::clear", arguments);
        
            query('.btn', this.passBtnContainer).forEach(function (node) {
                if (node.innerText.trim() !== '1') {
                    domConstruct.destroy(node);
                }
            });
            this.changePass({srcElement: {innerText: '1'}});
            this.clearGrid();
            this.moreInfoDialog.clearValues();
        },
        isValid: function () {
            // summary:
            //      validates this tab
            // returns: String (if not valid) | Boolean (true if valid)
            console.log(this.declaredClass + "::isValid", arguments);
        
            return this.isGridValid();
        },
        getData: function () {
            // summary:
            //      packages up the grid data as a record set
            console.log(this.declaredClass + "::getData", arguments);
        
            return {
                displayFieldName: '',
                features: this.getGridData()
            };
        },
        _setSelectedRowAttr: function (row) {
            // summary:
            //      overridden from _GridMixin
            // row: _Row
            console.log('app.Catch:_setSelectedRow', arguments);

            var value = (row) ? domClass.remove : domClass.add;

            query('.more-info>a', this.domNode).forEach(function (a) {
                value(a, 'disabled');
            });
        
            this.inherited(arguments);
        }
    });
});