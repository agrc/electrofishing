define([
    'dijit/registry',
    'dijit/_TemplatedMixin',
    'dijit/_WidgetBase',
    'dijit/_WidgetsInTemplateMixin',

    'dojo/dom-construct',
    'dojo/text!./templates/OtherOptionHandler.html',
    'dojo/_base/array',
    'dojo/_base/declare',
    'dojo/_base/lang'
], function (
    registry,
    _TemplatedMixin,
    _WidgetBase,
    _WidgetsInTemplateMixin,

    domConstruct,
    template,
    array,
    declare,
    lang
) {
    // summary:
    //      A dialog that shows when a user selects the "other" option in a dropdown.
    //      It shows existing options and give the user the ability to create a new one.
    //      It then updates the corresponding combobox.
    return declare([_WidgetBase, _TemplatedMixin, _WidgetsInTemplateMixin], {
        widgetsInTemplate: true,
        templateString: template,
        baseClass: 'other-option-handler',


        // options pass in via the constructor

        // select: Select Element
        //      The corresponding select element
        select: null,

        // otherTxt: String
        //      The other txt from Domains
        otherTxt: null,

        constructor: function (params) {
            // summary:
            //      description
            console.log('app/OtherOptionHandler:constructor', arguments);

            var parentWidget = registry.getEnclosingWidget(params.select);
            if (parentWidget) {
                parentWidget.def = this.def;
            }
        },
        postCreate: function () {
            // summary:
            //      set up widget
            console.log('app/OtherOptionHandler:postCreate', arguments);

            var that = this;

            array.forEach(this.select.children, function (option) {
                if (option.value !== '' && option.value !== that.otherTxt) {
                    var txt = option.innerHTML + ' (' + option.value + ')';
                    domConstruct.create('li', {innerHTML: txt}, that.existingOptionsList);
                }
            });
        },
        startup: function () {
            // summary:
            //      shows the dialog
            console.log('app/OtherOptionHandler:startup', arguments);

            $(this.modal).modal('show');

            setTimeout(lang.hitch(this.codeTxt, 'focus'), 200);
        },
        onSubmit: function () {
            // summary:
            //      fires when the submit button is clicked
            console.log('app/OtherOptionHandler:onSubmit', arguments);

            domConstruct.create('option', {
                innerHTML: this.descTxt.value,
                value: this.codeTxt.value
            }, this.select);
            this.select.value = this.codeTxt.value;

            $(this.select).combobox('refresh');

            $(this.modal).modal('hide');

            if (this.select.parentElement.children[0].children[1]) {
                this.select.parentElement.children[0].children[1].children[0].focus();
            }
        },
        onTxtChange: function () {
            // summary:
            //      sets the disabled state of the submit button
            console.log('app/OtherOptionHandler:onTxtChange', arguments);

            this.submitBtn.disabled = !(this.codeTxt.value.length > 0 && this.descTxt.value.length > 0);
        },
        destroyRecursive: function () {
            // summary:
            //      clean up
            console.log('app/OtherOptionHandler:destroyRecursive', arguments);

            domConstruct.destroy(this.modal);

            this.inherited(arguments);
        }
    });
});
