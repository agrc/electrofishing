define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/RaftBoatsContainer.html',
    'app/_MultipleWidgetsWithAddBtnMixin',
    'app/method/RaftBoat'

],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    _MultipleWidgetsWithAddBtnMixin,
    RaftBoat
    ) {
    // summary:
    //      A container for holding RaftBoat widgets.
    return declare('app.method.RaftBoatsContainer', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _MultipleWidgetsWithAddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'raft-boat-container equipment-container',

        constructor: function () {
            console.log(this.declaredClass + "::constructor", arguments);

            this.AddBtnWidgetClass = RaftBoat;

            this.inherited(arguments);
        },
        postCreate: function () {
            // summary:
            //      dom is ready
            console.log(this.declaredClass + "::postCreate", arguments);

            this.inherited(arguments);
        }
    });
});