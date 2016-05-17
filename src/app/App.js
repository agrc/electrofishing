define([
    'dojo/_base/declare',
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/App.html',
    'app/NewCollectionEvent',
    'agrc/modules/GUID',
    'dojo/topic',

    'dijit/layout/StackContainer',
    'dijit/layout/StackController',
    'app/Header',
    'dijit/layout/ContentPane',
    'app/SettingsDialog'
],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    NewCollectionEvent,
    GUID,
    topic
    ) {
    return declare("app.App", [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
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
            console.info(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            AGRC.app = this;
        },
        postCreate: function () {
            // summary:
            //      Fires when 
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
            
            AGRC.eventId = GUID.uuid();

            this.wireEvents();

            this.newEvent = new NewCollectionEvent({}, this.newEventDiv);

            document.body.className += ' loaded';
        },
        wireEvents: function () {
            // summary:
            //      Wires the events for this widget
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);

        }
    });
});