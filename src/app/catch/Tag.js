define([
    'app/config',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/catch/templates/Tag.html',
    'dojo/_base/declare',

    'bootstrap-combobox/js/bootstrap-combobox'
], function (
    config,
    _AddBtnMixin,
    _ClearValuesMixin,

    _TemplatedMixin,
    _WidgetBase,

    template,
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
                    control: this.frequencySelect,
                    fieldName: config.fieldNames.tags.FREQUENCY
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
        startup: function () {
            // summary:
            //      description
            // param: type or return: type
            console.log('app/catch/Tag:startup', arguments);


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
        }
    });
});
