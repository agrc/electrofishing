define([
    'app/config',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/query',
    'dojo/string',
    'dojo/text!app/method/templates/Equipment.html',
    'dojo/_base/declare',

    'ijit/modules/NumericInputValidator'
], function (
    config,
    _AddBtnMixin,
    _ClearValuesMixin,

    _TemplatedMixin,
    _WidgetBase,

    query,
    dojoString,
    template,
    declare,

    NumericInputValidator
) {
    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _AddBtnMixin], {
        templateString: template,
        baseClass: 'equipment',

        // requiredFields: Object[]
        //      An array of fields that need to be checked in isValid
        requiredFields: [
            ['voltsTxt', 'Voltage']
        ],


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/method/Equipment:postCreate', arguments);

            var fn = config.fieldNames.equipment;
            this.featureServiceUrl = config.urls.equipmentFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: fn.MODEL
                }, {
                    control: this.anodeShapeSelect,
                    fieldName: fn.ANODE_SHAPE
                }, {
                    control: this.arrayTypeSelect,
                    fieldName: fn.ARRAY_TYPE
                }, {
                    control: this.numberNettersTxt,
                    fieldName: fn.NUM_NETTERS
                }, {
                    control: this.cathodeTypeSelect,
                    fieldName: fn.CATHODE_TYPE
                }, {
                    control: this.numberAnodesTxt,
                    fieldName: fn.NUM_ANODES
                }, {
                    control: this.anodeDiameterTxt,
                    fieldName: fn.ANODE_DIAMETER
                }, {
                    control: this.stockDiameterTxt,
                    fieldName: fn.STOCK_DIAMETER
                }, {
                    control: this.cathodeLengthTxt,
                    fieldName: fn.CATHODE_LEN
                }, {
                    control: this.cathodeDiameterTxt,
                    fieldName: fn.CATHODE_DIAMETER
                }, {
                    control: this.machineResistenceTxt,
                    fieldName: fn.MACHINE_RES
                }, {
                    control: this.waveformSelect,
                    fieldName: fn.WAVEFORM
                }, {
                    control: this.voltsTxt,
                    fieldName: fn.VOLTAGE
                }, {
                    control: this.dutyCycleTxt,
                    fieldName: fn.DUTY_CYCLE
                }, {
                    control: this.frequencyTxt,
                    fieldName: fn.FREQUENCY
                }, {
                    control: this.ampsTxt,
                    fieldName: fn.AMPS
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

            $(this.raftTab).on('show.bs.tab', function setNum() {
                that.numberNettersTxt.value = 1;
            });
            $(this.raftTab).on('hide.bs.tab', function setNum() {
                that.numberNettersTxt.value = '';
            });

            this.inherited(arguments);
        },
        isValid: function () {
            // summary:
            //      checks all required values
            // returns: String (error message) | Boolean (true if valid)
            console.log('app/method/Equipment:isValid', arguments);

            var that = this;
            var requireField = function (fieldInfo) {
                var input = that[fieldInfo[0]];
                var name = fieldInfo[1];
                if (input.value === '') {
                    return dojoString.substitute(config.missingRequiredFieldTxt, [name]);
                } else {
                    return true;
                }
            }

            return this.requiredFields.map(requireField).reduce(function (previous, current) {
                if (previous === true) {
                    return current;
                } else {
                    return previous;
                }
            });
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
        }
    });
});