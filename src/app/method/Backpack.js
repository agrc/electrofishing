define([
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/text!app/method/templates/Backpack.html',
    'dojo/_base/declare'
],

function (
    _AddBtnMixin,
    _ClearValuesMixin,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    template,
    declare
) {
    return declare('app.method.Backpack', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin, _AddBtnMixin], {
        widgetsInTemplate: false,
        templateString: template,
        baseClass: 'backpack',


        postCreate: function () {
            // summary:
            //      widget dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.featureServiceUrl = AGRC.urls.backpacksFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: AGRC.fieldNames.backpacks.MODEL
                }, {
                    control: this.anodeShapeSelect,
                    fieldName: AGRC.fieldNames.backpacks.ANODE_SHAPE
                }
            ];

            this.inherited(arguments);
        },
        addConstantValues: function (data) {
            // summary:
            //      see _AddBtnMixin
            // data: {}
            // returns: {}
            console.log(this.declaredClass + '::addConstantValues', arguments);

            data[AGRC.fieldNames.backpacks.EVENT_ID] = AGRC.eventId;

            return data;
        }
    });
});
