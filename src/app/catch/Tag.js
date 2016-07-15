define([
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',

    'dojo/text!app/catch/templates/Tag.html',
    'dojo/_base/declare',

    'bootstrap-combobox/js/bootstrap-combobox'
],

function (
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

            this.featureServiceUrl = AGRC.urls.tagsFeatureService;
            this.fields = [
                {
                    control: this.frequencySelect,
                    fieldName: AGRC.fieldNames.tags.FREQUENCY
                }, {
                    control: this.typeSelect,
                    fieldName: AGRC.fieldNames.tags.TYPE
                }, {
                    control: this.colorSelect,
                    fieldName: AGRC.fieldNames.tags.COLOR
                }, {
                    control: this.locationSelect,
                    fieldName: AGRC.fieldNames.tags.LOCATION
                }, {
                    control: this.newSelect,
                    fieldName: AGRC.fieldNames.tags.NEW_TAG
                }, {
                    control: this.numberTxt,
                    fieldName: AGRC.fieldNames.tags.NUMBER
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

            data[AGRC.fieldNames.tags.FISH_ID] = this.container.currentFishId;

            return data;
        }
    });
});
