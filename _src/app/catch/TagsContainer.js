define([
  'app/catch/Tag',
  'app/_MultipleWidgetsWithAddBtnMixin',

  'dijit/_TemplatedMixin',
  'dijit/_WidgetBase',
  'dijit/_WidgetsInTemplateMixin',

  'dojo/text!app/catch/templates/TagsContainer.html',
  'dojo/_base/declare',
], function (
  Tag,
  _MultipleWidgetsWithAddBtnMixin,

  _TemplatedMixin,
  _WidgetBase,
  _WidgetsInTemplateMixin,

  template,
  declare
) {
  // summary:
  //      Container widget for Tag widgets.
  return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin, _MultipleWidgetsWithAddBtnMixin], {
    widgetsInTemplate: true,
    templateString: template,
    baseClass: 'tags-container',

    // currentFishId: String (guid)
    //      the guid corresponding to the currently selected fish in the catch grid
    currentFishId: null,

    constructor: function () {
      console.log('app/catch/TagsContainer:constructor', arguments);

      this.AddBtnWidgetClass = Tag;
    },
  });
});
