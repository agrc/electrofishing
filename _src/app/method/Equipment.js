define([
    'app/config',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',
    'app/_GridMixin',
    'app/_InProgressCacheMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/dom-style',
    'dojo/query',
    'dojo/text!app/method/templates/Equipment.html',
    'dojo/_base/declare',

    'dojox/uuid/generateRandomUuid',

    'ijit/modules/NumericInputValidator',

    'localforage'
], function (
    config,
    _AddBtnMixin,
    _ClearValuesMixin,
    _GridMixin,
    _InProgressCacheMixin,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    domStyle,
    query,
    template,
    declare,

    generateRandomUuid,

    NumericInputValidator,

    localforage
) {
    var FN = config.fieldNames;
    var tempID = 'temp_id';

    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _AddBtnMixin, _InProgressCacheMixin, _GridMixin], {
        templateString: template,
        baseClass: 'equipment',

        // requiredFields: Object[]
        //      An array of fields that need to be checked in isValid
        requiredFields: [],

        // gridDiv: String
        //      dojo attach point to div for grid
        //      defined in widget template
        gridDiv: null,

        // skipNumber: Number
        //      The number of fields to skip when you tab at the end of the row
        //      This is to skip over the hidden fields
        //      required for _GridMixin
        skipNumber: 3,

        // lastColumn: String
        //      required for _GridMixin
        //      set in constructor
        lastColumn: null,

        // firstColumn: String
        //      required for _GridMixin
        //      set in constructor
        firstColumn: null,

        // idProperty: String
        //      required for _GridMixin, not in corresponding data table.
        //      Stripped off before the data is sent to the server.
        idProperty: tempID,

        // ignoreColumn: String
        //      the name of the column in the grid to ignore when data is sent to the server
        ignoreColumn: tempID,

        // guid: Guid
        //      value that will populate EQUIPMENT_ID in the database
        guid: null,


        // passed into constructor

        // cacheId: String
        //      set by _MultipleWidgetsWithAddBtnMixin
        cacheId: null,


        constructor: function () {
            // summary:
            //      set up the grid props
            console.log('app/method/Equipment:constructor', arguments);

            this.guid = '{' + generateRandomUuid() + '}';

            this.firstColumn = FN.anodes.ANODE_DIAMETER;
            this.lastColumn = FN.anodes.STOCK_DIAMETER;
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/method/Equipment:postCreate', arguments);

            this.featureServiceUrl = config.urls.equipmentFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: FN.equipment.MODEL,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.anodeShapeSelect,
                    fieldName: FN.equipment.ANODE_SHAPE,
                    backpack: true,
                    canoe: true,
                    raft: false
                }, {
                    control: this.arrayTypeSelect,
                    fieldName: FN.equipment.ARRAY_TYPE,
                    backpack: false,
                    canoe: false,
                    raft: true
                }, {
                    control: this.numberNettersTxt,
                    fieldName: FN.equipment.NUM_NETTERS,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeTypeSelect,
                    fieldName: FN.equipment.CATHODE_TYPE,
                    backpack: false,
                    canoe: true,
                    raft: true
                }, {
                    control: this.numberAnodesTxt,
                    fieldName: FN.equipment.NUM_ANODES,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeLengthTxt,
                    fieldName: FN.equipment.CATHODE_LEN,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeDiameterTxt,
                    fieldName: FN.equipment.CATHODE_DIAMETER,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.machineResistenceTxt,
                    fieldName: FN.equipment.MACHINE_RES,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.waveformSelect,
                    fieldName: FN.equipment.WAVEFORM,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.voltsTxt,
                    fieldName: FN.equipment.VOLTAGE,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.dutyCycleTxt,
                    fieldName: FN.equipment.DUTY_CYCLE,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.frequencyTxt,
                    fieldName: FN.equipment.FREQUENCY,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.ampsTxt,
                    fieldName: FN.equipment.AMPS,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.durationTxt,
                    fieldName: FN.equipment.DURATION,
                    backpack: true,
                    canoe: true,
                    raft: true
                }
            ];

            var columns = [{
                label: this.idProperty,
                field: this.idProperty,
                sortable: false
            }, {
                label: FN.anodes.EQUIPMENT_ID,
                field: FN.anodes.EQUIPMENT_ID,
                sortable: false
            }, {
                autoSave: true,
                label: 'Anode Diameter (cm)',
                field: FN.anodes.ANODE_DIAMETER,
                editor: this.NewNumberSpinner,
                sortable: false,
                autoSelect: true,
                editOn: 'focus',
                editorArgs: {
                    constraints: {
                        min: 1,
                        max: 750
                    }
                }
            }, {
                autoSave: true,
                label: 'Stock Diameter (cm)',
                field: FN.anodes.STOCK_DIAMETER,
                editor: this.NewNumberSpinner,
                sortable: false,
                autoSelect: true,
                editOn: 'focus',
                editorArgs: {
                    constraints: {
                        min: 0.1,
                        max: 2.54,
                        step: 0.01
                    }
                }
            }];
            this.initGrid(columns);

            // relayout grid once method tab has been shown
            // this prevents the headers from being overlapped by the first row
            $('a[href="#methodTab"]').one('shown.bs.tab', function () {
                this.grid.startup();
            }.bind(this));

            this.onAnodeNumChange();

            var validator = new NumericInputValidator();
            validator.init(this.domNode);

            this.inherited(arguments);
        },
        addRow: function () {
            // summary:
            //      adds a new blank row to the diet grid
            console.log('app/method/Equipment:addRow', arguments);

            var data = {};

            data[this.idProperty] = this.grid.collection.data.length + 1;
            data[FN.anodes.EQUIPMENT_ID] = this.guid;
            data[FN.anodes.ANODE_DIAMETER] = null;
            data[FN.anodes.STOCK_DIAMETER] = null;

            this.grid.collection.add(data);
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/method/Equipment:wireEvents', arguments);

            var that = this;
            $(this.cathodeTypeSelect).on('change', function onChange(event) {
                that.onCathodeTypeChange(event.target.value);
            });

            query('.nav-pills li', this.domNode).on('click', function (event) {
                that.typeTxt.value = event.currentTarget.dataset.type;
            });

            this.inherited(arguments);
        },
        onAnodeNumChange: function () {
            // summary:
            //      adds or removes rows in the anode grid to match the number in the anode num text box
            console.log('app/method/Equipment:onAnodeNumChange', arguments);

            var newNum = this.numberAnodesTxt.value;
            var currentGridLength = this.grid.collection.data.length;

            while (newNum > currentGridLength) {
                this.addRow();
                currentGridLength++;
            }

            while (newNum < currentGridLength) {
                this.grid.select(this.getLastRow(this.store.data));
                this.deleteRow();
                currentGridLength--;
            }
        },
        toggleFields: function (event) {
            // summary:
            //      click event handler for toggling the equipment field options
            // click event
            console.info('app/method/Equipment:toggleFields', arguments);

            var activeTab = event.target.id.toLowerCase();
            if (!activeTab) {
                return;
            }

            var that = this;
            setTimeout(function () {
                that.fields.forEach(function (field) {
                    var show = field[activeTab];
                    if (show === false) {
                        that.clearValue(field.control);
                    }
                    console.log(field);
                    domClass.toggle(field.control.parentNode, 'hidden', !show);
                });

                that.cacheInProgressData();
            }, 100);
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      overriden from _InProgressCacheMixin to set the nav pills and guid
            console.log('app/method/Equipment:hydrateWithInProgressData', arguments);

            this.inherited(arguments).then(function (inProgressData) {
                if (inProgressData) {
                    if (inProgressData[this.typeTxt.dataset.dojoAttachPoint]) {
                        // manually click the corresponding pill button
                        var selector = '.nav-pills li[data-type="' +
                            inProgressData[this.typeTxt.dataset.dojoAttachPoint] + '"] a';
                        query(selector, this.domNode)[0].click();
                    }

                    if (inProgressData.gridData) {
                        this.setGridData(inProgressData.gridData);
                        this.grid.refresh();
                    }

                    if (inProgressData.guid) {
                        this.guid = inProgressData.guid;
                    }
                }

                this.store.on('add, update, delete', this.cacheInProgressData.bind(this));
            }.bind(this));
        },
        getAdditionalCacheData: function () {
            // summary:
            //      overriden from _InProgressCacheMixin to cache the anode grid
            console.log('app/method/Equipment:getAdditionalCacheData', arguments);

            return {
                guid: this.guid,
                gridData: JSON.parse(JSON.stringify(this.store.fetchSync()))
            };
        },
        isValid: function () {
            // summary:
            //      checks all required values
            // returns: String (error message) | Boolean (true if valid)
            console.log('app/method/Equipment:isValid', arguments);

            return true;
        },
        onCathodeTypeChange: function (value) {
            // summary:
            //      in charge of enabling or disabling the cathode diameter text box
            // value: String
            //      The new value of the cathode type select
            console.log('app/method/Equipment:onCathodeTypeChange', arguments);

            if (value === 'b') {
                this.cathodeDiameterTxt.disabled = true;
                this.cathodeDiameterTxt.value = '';
            } else {
                this.cathodeDiameterTxt.disabled = false;
            }
        },
        addConstantValues: function (data) {
            // summary:
            //      adds the eventId to the data
            // data: Object
            console.log('app/method/Equipment:addConstantValues', arguments);

            data[FN.equipment.EVENT_ID] = config.eventId;
            data[FN.equipment.TYPE] = query('.nav-pills li.active', this.domNode)[0].dataset.type;
            data[FN.equipment.EQUIPMENT_ID] = this.guid;

            return data;
        },
        onRemove: function () {
            // summary:
            //      remove cached in progress data item
            console.log('app/method/Equipment:onRemove', arguments);

            localforage.removeItem(this.cacheId);

            this.inherited(arguments);
        },
        getAnodesData: function () {
            // summary:
            //      returns the anodes grid data
            // param or return
            console.log('app/method/Equipment:getAnodesData', arguments);

            return this.getGridData();
        }
    });
});
