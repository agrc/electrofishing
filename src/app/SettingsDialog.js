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
    return declare('app.SettingsDialog', [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'settings-dialog',

        constructor: function () {
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + "::" + arguments.callee.nom, arguments);
        }
    });
});