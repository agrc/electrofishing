define([
    'app/config',
    'app/NewCollectionEvent',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!app/templates/App.html',
    'dojo/_base/declare',

    'toaster',

    'app/Header',
    'app/SettingsDialog',
    'bootstrap',
    'dijit/layout/ContentPane',
    'dijit/layout/StackContainer',
    'dijit/layout/StackController'
], function (
    config,
    NewCollectionEvent,

    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    template,
    declare,

    Toaster
) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        // summary:
        //      The main widget for the app

        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'app',

        // map: agrc.widgets.map.Basemap
        map: null,

        // fGroup: L.FeatureGroup
        fGroup: null,

        constructor: function () {
            // summary:
            //      first function to fire after page loads
            console.log('app/App:constructor', arguments);

            config.app = this;
        },
        postCreate: function () {
            // summary:
            //      Fires when
            console.log('app/App:postCreate', arguments);

            this.newEvent = new NewCollectionEvent({}, this.newEventDiv);

            document.body.className += ' loaded';

            /* eslint-disable new-cap */
            var toaster = new Toaster.default(null, domConstruct.create('div', null, this.domNode));
            /* eslint-enable new-cap */
            toaster.startup();
        }
    });
});