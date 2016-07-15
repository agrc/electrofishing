define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/templates/SettingsDialog.html',

    'app/location/CoordTypeToggle'
],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template) {
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'settings-dialog',

        constructor: function () {
            console.log('app/SettingsDialog:constructor', arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log('app/SettingsDialog:postCreate', arguments);
        }
    });
});
