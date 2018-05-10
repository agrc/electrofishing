define([
    'app/config',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/dom-class',
    'dojo/text!app/catch/templates/Tag.html',
    'dojo/_base/array',
    'dojo/_base/declare',

    'bootstrap-combobox/js/bootstrap-combobox'
], function (
    config,
    _AddBtnMixin,
    _ClearValuesMixin,

    _TemplatedMixin,
    _WidgetBase,

    domClass,
    template,
    array,
    declare
) {
    // summary:
    //      Tags in MoreInfoDialog in catch tab.
    return declare([_WidgetBase, _TemplatedMixin, _ClearValuesMixin, _AddBtnMixin], {
        templateString: template,
        baseClass: 'tag',


        postCreate: function () {
            // summary:
            //      description
            console.log(this.declaredClass + '::postCreate', arguments);

            this.featureServiceUrl = config.urls.tagsFeatureService;
            this.fields = [
                {
                    control: this.transponderFreqSelect,
                    fieldName: config.fieldNames.tags.TRANSPONDER_FREQ
                }, {
                    control: this.transmitterFreqTxt,
                    fieldName: config.fieldNames.tags.TRANSMITTER_FREQ
                }, {
                    control: this.transmitterFreqTypeSelect,
                    fieldName: config.fieldNames.tags.TRANSMITTER_FREQ_TYPE
                }, {
                    control: this.typeSelect,
                    fieldName: config.fieldNames.tags.TYPE
                }, {
                    control: this.colorSelect,
                    fieldName: config.fieldNames.tags.COLOR
                }, {
                    control: this.locationSelect,
                    fieldName: config.fieldNames.tags.LOCATION
                }, {
                    control: this.newSelect,
                    fieldName: config.fieldNames.tags.NEW_TAG
                }, {
                    control: this.numberTxt,
                    fieldName: config.fieldNames.tags.NUMBER
                }
            ];

            this.inherited(arguments);
        },
        addConstantValues: function (data) {
            // summary:
            //      adds constants to the data object before it's sent
            //      called in _AddBtnMixin
            // data: {}
            // returns: {}
            console.log(this.declaredClass + '::addConstantValues', arguments);

            data[config.fieldNames.tags.FISH_ID] = this.container.currentFishId;

            return data;
        },
        setData: function (feature, lastOne) {
            // summary:
            //      pre-populates controls with data
            // feature: {}
            // lastOne: Boolean
            //      controls whether the plus or minus icons are show
            console.log('app/_AddBtnMixin:setData', arguments);

            var that = this;
            var getControl = function (fieldName) {
                var control;
                array.some(that.fields, function (fld) {
                    if (fld.fieldName === fieldName) {
                        control = fld.control;

                        return false;
                    }
                });

                return control;
            };
            for (var fn in feature) {
                if (fn === config.fieldNames.tags.FISH_ID) {
                    this.container.currentFishId = feature[fn];
                } else {
                    var control = getControl(fn);
                    control.value = feature[fn];
                    if (control.type === 'select-one') {
                        $(control).combobox('refresh');
                    }
                }
            }

            if (!lastOne) {
                domClass.add(this.icon, this.minusIconClass);
                domClass.remove(this.icon, this.plusIconClass);
            }
        }
    });
});
