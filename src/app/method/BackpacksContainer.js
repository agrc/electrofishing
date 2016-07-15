define([
    'dojo/_base/declare',
    'dijit/_WidgetBase',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/BackpacksContainer.html',
    'app/_MultipleWidgetsWithAddBtnMixin',
    'app/method/Backpack'

],

function (
    declare,
    _WidgetBase,
    _TemplatedMixin,
    _WidgetsInTemplateMixin,
    template,
    _MultipleWidgetsWithAddBtnMixin,
    Backpack
    ) {
    // summary:
    //      The container for the backpage widgets
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _MultipleWidgetsWithAddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'backpacks-container equipment-container',

        constructor: function () {
            console.log(this.declaredClass + '::constructor', arguments);

            this.AddBtnWidgetClass = Backpack;
        }
    });
});
