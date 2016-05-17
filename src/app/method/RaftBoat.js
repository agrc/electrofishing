define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/RaftBoat.html',
    'app/_AddBtnMixin',
    'app/_ClearValuesMixin',
    'dojo/dom-class',
    'dojo/topic'

],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    _AddBtnMixin,
    _ClearValuesMixin,
    domClass,
    topic
    ) {
    // summary:
    //      Contains fields specific to rafts and boats
    return declare('app.method.RaftBoat', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _ClearValuesMixin, _AddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'raft-boat',


        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + '::postCreate', arguments);

            this.featureServiceUrl = AGRC.urls.raftsboatsFeatureService;
            this.fields = [
                {
                    control: this.modelSelect,
                    fieldName: AGRC.fieldNames.raftsboats.MODEL
                }, {
                    control: this.arrayTypeSelect,
                    fieldName: AGRC.fieldNames.raftsboats.ARRAY_TYPE
                }, {
                    control: this.cathodeTypeSelect,
                    fieldName: AGRC.fieldNames.raftsboats.CATHODE_TYPE
                }, {
                    control: this.numberTxt,
                    fieldName: AGRC.fieldNames.raftsboats.NUM_NETTERS
                }
            ];

            this.inherited(arguments);
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/method/RaftBoat::wireEvents', arguments);

            var that = this;
            $(this.cathodeTypeSelect).on('change', function () {
                topic.publish(AGRC.topics.onCathodeTypeChange, that.cathodeTypeSelect.value);
            });

            this.inherited(arguments);
        },
        getData: function () {
            // summary:
            //      wrapper around _AddBtnMixin::getData to only return data if this widget
            //      is visible
            console.log(this.declaredClass + '::getData', arguments);

            if (domClass.contains(this.domNode.parentElement, 'active')) {
                return this.inherited(arguments);
            } else {
                return null;
            }
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
