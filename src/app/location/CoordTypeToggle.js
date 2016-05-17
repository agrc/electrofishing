define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/location/templates/CoordTypeToggle.html',
    'dojo/query',
    'dojo/topic'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    query,
    topic) {
    return declare('app.location.CoordTypeToggle', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: false,
        templateString: template,

        // currentType: String (AGRC.coordTypes)
        //      The currently selected coord type
        currentType: null,

        constructor: function () {
            console.log('app/location/CoordTypeToggle:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/location/CoordTypeToggle:postCreate', arguments);

            this.wireEvents(topic);

            if (!localStorage.coordType) {
                // default to utm83 coord type
                this.onChange(AGRC.coordTypes.utm83, topic);
            } else {
                $(this['coord_' + localStorage.coordType + 'Btn']).button('toggle');
                this.onChange(localStorage.coordType, topic);
            }
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/location/CoordTypeToggle:wireEvents', arguments);

            var that = this;

            query('.btn', this.domNode).on('click', function (evt) {
                that.onChange(evt.target.children[0].value, topic);
            });
        },
        onChange: function (type, topic) {
            // summary:
            //      Fires when one of the buttons has been selected
            // type: String (AGRC.coordTypes)
            // topic: dojo/topic
            console.log('app/location/CoordTypeToggle:onChange', arguments);

            this.currentType = type;

            // store in localStorage
            localStorage.coordType = type;

            topic.publish(AGRC.topics.coordTypeToggle_onChange, type);
        }
    });
});
