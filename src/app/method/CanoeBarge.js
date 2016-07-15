define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/CanoeBarge.html',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin'

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
    //      specs that are specific to Canoe/Barges
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin, _AddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'canoe-barge',


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.featureServiceUrl = AGRC.urls.canoesbargesFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: AGRC.fieldNames.canoesbarges.MODEL
                }, {
                    control: this.anodeShapeSelect,
                    fieldName: AGRC.fieldNames.canoesbarges.ANODE_SHAPE
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

            data[AGRC.fieldNames.canoesbarges.EVENT_ID] = AGRC.eventId;

            return data;
        }
    });
});
