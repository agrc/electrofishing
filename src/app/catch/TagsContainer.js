define([
    'dojo/_base/declare', 
    'dijit/_WidgetBase', 
    'dijit/_TemplatedMixin', 
    'dijit/_WidgetsInTemplateMixin',
    'dojo/text!app/catch/templates/TagsContainer.html',
    'app/_MultipleWidgetsWithAddBtnMixin',
    'app/catch/Tag'

],

function (
    declare, 
    _WidgetBase, 
    _TemplatedMixin, 
    _WidgetsInTemplateMixin, 
    template,
    _MultipleWidgetsWithAddBtnMixin,
    Tag
    ) {
    // summary:
    //      Container widget for Tag widgets.
    return declare('app/catch/TagsContainer', 
        [_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _MultipleWidgetsWithAddBtnMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'tags-container',

        // currentFishId: String (guid)
        //      the guid corresponding to the currently selected fish in the catch grid
        currentFishId: null,
        
        constructor: function () {
            console.log(this.declaredClass + "::constructor", arguments);

            this.AddBtnWidgetClass = Tag;
        }
    });
});