define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/method/templates/CanoeBargesContainer.html',
    'app/_MultipleWidgetsWithAddBtnMixin',
    'app/method/CanoeBarge'

],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    _MultipleWidgetsWithAddBtnMixin,
    CanoeBarge
    ) {
    // summary:
    //      Container for CanoeBarge Widgets
    return declare('app.method.CanoeBargesContainer', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _MultipleWidgetsWithAddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'canoe-barges-container equipment-container',

        constructor: function () {
            console.log(this.declaredClass + "::constructor", arguments);

            this.AddBtnWidgetClass = CanoeBarge;

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