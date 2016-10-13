define([
    'app/config',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/query',
    'dojo/text!app/templates/SettingsDialog.html',
    'dojo/topic',
    'dojo/_base/declare'
], function (
    config,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    query,
    template,
    topic,
    declare
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'settings-dialog',

        // currentType: String (config.coordTypes)
        //      The currently selected coord type
        currentType: null,

        constructor: function () {
            console.log('app/SettingsDialog:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/SettingsDialog:postCreate', arguments);

            this.wireEvents();

            if (!localStorage.coordType) {
                // default to utm83 coord type
                this.onCoordTypeChange(config.coordTypes.utm83);
            } else {
                $(this['coord_' + localStorage.coordType + 'Btn']).button('toggle');
                this.onCoordTypeChange(localStorage.coordType);
            }

            this.streamsLakesChBox.checked = (localStorage.streamsLakesToggle === 'true') ? true : false;
            this.onStreamsLakesChange();

            this.mouseWheelChBox.checked = (localStorage.mouseWheelZooming === 'true') ? true : false;
            this.onMouseWheelChange();
        },
        wireEvents: function () {
            // summary:
            //      description
            console.log('app/SettingsDialog:wireEvents', arguments);

            var that = this;

            query('.btn-group .btn', this.domNode).on('click', function (evt) {
                that.onCoordTypeChange(evt.target.children[0].value);
            });
        },
        onCoordTypeChange: function (type) {
            // summary:
            //      Fires when one of the buttons has been selected
            // type: String (config.coordTypes)
            console.log('app/SettingsDialog:onCoordTypeChange', arguments);

            this.currentType = type;

            // store in localStorage
            localStorage.coordType = type;

            topic.publish(config.topics.coordTypeToggle_onChange, type);
        },
        onMouseWheelChange: function () {
            // summary:
            //      update localstorage and fire topic
            console.log('app/SettingsDialog:onMouseWheelChange', arguments);

            localStorage.mouseWheelZooming = this.mouseWheelChBox.checked;

            topic.publish(config.topics.mouseWheelZooming_onChange, this.mouseWheelChBox.checked);
        },
        onStreamsLakesChange: function () {
            // summary:
            //      toggle the visibility of the reference layers on the map
            console.log('app/SettingsDialog:onStreamsLakesChange', arguments);

            localStorage.streamsLakesToggle = this.streamsLakesChBox.checked;

            topic.publish(config.topics.streamsLakes_toggle, this.streamsLakesChBox.checked);
        }
    });
});
