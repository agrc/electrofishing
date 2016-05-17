define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/catch/templates/Tag.html',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'bootstrap-combobox/js/bootstrap-combobox'
],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    _AddBtnMixin,
    _ClearValuesMixin
    ) {
    // summary:
    //      Tags in MoreInfoDialog in catch tab.
    return declare('app/catch/Tag', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin, _AddBtnMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'tag',


        postCreate: function () {
            // summary:
            //      description
            console.log(this.declaredClass + "::postCreate", arguments);
        
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
            console.log(this.declaredClass + "::addConstantValues", arguments);
        
            data[AGRC.fieldNames.tags.FISH_ID] = this.container.currentFishId;

            return data;
        }
    });
});