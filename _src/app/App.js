define([
    'app/config',
    'app/NewCollectionEvent',

    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!app/templates/App.html',
    'dojo/_base/declare',

    'react',

    'react-dom',

    'react-app/components/Header',

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

    React,

    ReactDOM,

    Header
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

            // this needs to be called before NewCollectionEvent...or else the grid has issues (empty)
            ReactDOM.render(React.createElement(Header.default), this.header);

            this.newEvent = new NewCollectionEvent({}, this.newEventDiv);
            this.newEvent.startup();

            document.body.className += ' loaded';

            /* eslint-disable new-cap */
            var toaster = new Toaster.default(null, domConstruct.create('div', null, this.domNode));
            /* eslint-enable new-cap */
            toaster.startup();
        }
    });
});
