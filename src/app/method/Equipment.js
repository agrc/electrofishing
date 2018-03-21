define([
    'app/config',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',
    'app/_InProgressCacheMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/query',
    'dojo/string',
    'dojo/text!app/method/templates/Equipment.html',
    'dojo/_base/declare',

    'ijit/modules/NumericInputValidator',

    'localforage'
], function (
    config,
    _AddBtnMixin,
    _ClearValuesMixin,
    _InProgressCacheMixin,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    query,
    dojoString,
    template,
    declare,

    NumericInputValidator,

    localforage
) {
    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _AddBtnMixin, _InProgressCacheMixin], {
        templateString: template,
        baseClass: 'equipment',

        // requiredFields: Object[]
        //      An array of fields that need to be checked in isValid
        requiredFields: [],


        // passed into constructor

        // cacheId: String
        //      set by _MultipleWidgetsWithAddBtnMixin
        cacheId: null,


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/method/Equipment:postCreate', arguments);

            var fn = config.fieldNames.equipment;
            this.featureServiceUrl = config.urls.equipmentFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: fn.MODEL,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.anodeShapeSelect,
                    fieldName: fn.ANODE_SHAPE,
                    backpack: true,
                    canoe: true,
                    raft: false
                }, {
                    control: this.arrayTypeSelect,
                    fieldName: fn.ARRAY_TYPE,
                    backpack: false,
                    canoe: false,
                    raft: true
                }, {
                    control: this.numberNettersTxt,
                    fieldName: fn.NUM_NETTERS,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeTypeSelect,
                    fieldName: fn.CATHODE_TYPE,
                    backpack: false,
                    canoe: true,
                    raft: true
                }, {
                    control: this.numberAnodesTxt,
                    fieldName: fn.NUM_ANODES,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.anodeDiameterTxt,
                    fieldName: fn.ANODE_DIAMETER,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.stockDiameterTxt,
                    fieldName: fn.STOCK_DIAMETER,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeLengthTxt,
                    fieldName: fn.CATHODE_LEN,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.cathodeDiameterTxt,
                    fieldName: fn.CATHODE_DIAMETER,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.machineResistenceTxt,
                    fieldName: fn.MACHINE_RES,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.waveformSelect,
                    fieldName: fn.WAVEFORM,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.voltsTxt,
                    fieldName: fn.VOLTAGE,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.dutyCycleTxt,
                    fieldName: fn.DUTY_CYCLE,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.frequencyTxt,
                    fieldName: fn.FREQUENCY,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.ampsTxt,
                    fieldName: fn.AMPS,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.surveyPurposeSelect,
                    fieldName: fn.PURPOSE,
                    backpack: true,
                    canoe: true,
                    raft: true
                }, {
                    control: this.durationTxt,
                    fieldName: fn.DURATION,
                    backpack: true,
                    canoe: true,
                    raft: true
                }
            ];

            var validator = new NumericInputValidator();
            validator.init(this.domNode);

            this.inherited(arguments);
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
                    domClass.toggle(field.control.parentNode, 'hidden', !show);
                });

                that.cacheInProgressData();
            }, 100);
        },
        hydrateWithInProgressData: function () {
            // summary:
            //      overriden from _InProgressCacheMixin to set the nav pills
            // param or return
            console.log('app/method/Equipment:hydrateWithInProgressData', arguments);

            var that = this;
            this.inherited(arguments).then(function (inProgressData) {
                if (inProgressData && inProgressData[that.typeTxt.dataset.dojoAttachPoint]) {
                    // manually click the corresponding pill button
                    var selector = '.nav-pills li[data-type="' + inProgressData[that.typeTxt.dataset.dojoAttachPoint] + '"] a';
                    query(selector, that.domNode)[0].click();
                }
            });
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

            data[config.fieldNames.equipment.EVENT_ID] = config.eventId;
            data[config.fieldNames.equipment.TYPE] = query('.nav-pills li.active', this.domNode)[0].dataset.type;

            return data;
        },
        onRemove: function () {
            // summary:
            //      remove cached in progress data item
            console.log('app/method/Equipment:onRemove', arguments);

            localforage.removeItem(this.cacheId);

            this.inherited(arguments);
        }
    });
});
